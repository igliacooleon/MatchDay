import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MATCHDAY_ADDRESS, MATCHDAY_ABI } from "@/constants/contracts";
import { encryptWeight } from "@/lib/fhe";
import { useState, useCallback } from "react";
import { toast } from "./use-toast";
import type { Address } from "viem";

// Hook to read league data
export function useLeagueData(leagueId: string) {
  const { data: metaData, refetch: refetchLeague, isError, isLoading } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: "getLeagueMeta",
    args: [leagueId],
  });

  const { data: matchesData } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: "getMatches",
    args: [leagueId],
  });

  return {
    league: metaData
      ? {
          exists: true,
          entryFee: metaData[0],
          lockTime: metaData[1],
          prizePool: metaData[2],
          cancelled: metaData[3],
          settled: metaData[4],
          goalsThreshold: metaData[5],
        }
      : null,
    matchCount: matchesData ? matchesData.length : 0,
    isError,
    isLoading,
    refetchLeague,
  };
}

// Hook to read user entry data
export function useUserEntry(leagueId: string) {
  const { address } = useAccount();

  const { data: entryData, refetch: refetchEntry } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: "getEntry",
    args: address ? [leagueId, address] : undefined,
  });

  return {
    entry: entryData
      ? {
          exists: entryData[0],
          claimed: entryData[1],
          winnerPicks: entryData[2],
          goalsPicks: entryData[3],
          penaltyPicks: entryData[4],
          handle: entryData[5],
          decryptable: entryData[6]
        }
      : null,
    refetchEntry,
  };
}

// Hook to read ALL user entries across leagues
export function useUserEntries() {
  const { address } = useAccount();
  const { data: leagueIdsData } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: "listLeagues"
  });

  const leagues: string[] = (leagueIdsData as string[]) || [];

  const { data: entriesData, isLoading } = useReadContracts({
    contracts: leagues.map((leagueId) => ({
      address: MATCHDAY_ADDRESS,
      abi: MATCHDAY_ABI,
      functionName: "getEntry",
      args: address ? [leagueId, address] : undefined
    })),
    query: {
      enabled: Boolean(address && leagues.length > 0)
    }
  });

  const entries =
    entriesData?.map((res, idx) => {
      if (!res.result) {
        return { leagueId: leagues[idx], exists: false };
      }
      const tuple = res.result as any[];
      return {
        leagueId: leagues[idx],
        exists: tuple[0],
        claimed: tuple[1],
        winnerPicks: tuple[2],
        goalsPicks: tuple[3],
        penaltyPicks: tuple[4],
        handle: tuple[5],
        decryptable: tuple[6]
      };
    }) || [];

  return { entries, isLoading };
}

// Hook to read match data
export function useMatchData(leagueId: string, matchIndex: number) {
  const { data: matchData } = useReadContract({
    address: MATCHDAY_ADDRESS,
    abi: MATCHDAY_ABI,
    functionName: "getMatch",
    args: [leagueId, BigInt(matchIndex)],
  });

  return {
    match: matchData
      ? {
          label: matchData[0],
          homeTeam: matchData[1],
          awayTeam: matchData[2],
          finalWinner: matchData[3],
          finalGoals: matchData[4],
          finalPenalty: matchData[5],
        }
      : null,
  };
}

// Hook to create a league
export function useCreateLeague() {
  const { writeContract, data: hash } = useWriteContract();
  const [isCreating, setIsCreating] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createLeague = useCallback(
    async (params: {
      leagueId: string;
      entryFee: bigint;
      duration: bigint;
      labels: string[];
      homeTeams: string[];
      awayTeams: string[];
      goalsThreshold: number;
    }) => {
      setIsCreating(true);
      try {
        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "createLeague",
          args: [
            params.leagueId,
            params.entryFee,
            params.duration,
            params.labels,
            params.homeTeams,
            params.awayTeams,
            params.goalsThreshold,
          ],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create league",
          variant: "destructive",
        });
        setIsCreating(false);
      }
    },
    [writeContract]
  );

  return {
    createLeague,
    isCreating: isCreating || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to enter a league
export function useEnterLeague() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [isEntering, setIsEntering] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const enterLeague = useCallback(
    async (params: {
      leagueId: string;
      winnerPicks: number[];
      goalsPicks: number[];
      penaltyPicks: number[];
      weight: bigint;
      entryFee: bigint;
    }) => {
      if (!address) {
        toast({
          title: "Error",
          description: "Please connect your wallet",
          variant: "destructive",
        });
        return;
      }

      setIsEntering(true);
      setIsEncrypting(true);

      try {
        // Encrypt weight
        const { handle, proof } = await encryptWeight(
          params.weight,
          address as Address,
          MATCHDAY_ADDRESS
        );

        setIsEncrypting(false);

        // Submit transaction
        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "enterLeague",
          args: [
            params.leagueId,
            params.winnerPicks as any,
            params.goalsPicks as any,
            params.penaltyPicks as any,
            handle,
            proof,
          ],
          value: params.entryFee,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to enter league",
          variant: "destructive",
        });
        setIsEntering(false);
        setIsEncrypting(false);
      }
    },
    [address, writeContract]
  );

  return {
    enterLeague,
    isEntering: isEntering || isConfirming,
    isEncrypting,
    isSuccess,
    hash,
  };
}

// Hook to adjust entry
export function useAdjustEntry() {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const adjustEntry = useCallback(
    async (params: {
      leagueId: string;
      winnerPicks: number[];
      goalsPicks: number[];
      penaltyPicks: number[];
      weight: bigint;
    }) => {
      if (!address) return;

      setIsAdjusting(true);
      setIsEncrypting(true);

      try {
        const { handle, proof } = await encryptWeight(
          params.weight,
          address as Address,
          MATCHDAY_ADDRESS
        );

        setIsEncrypting(false);

        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "adjustEntry",
          args: [
            params.leagueId,
            params.winnerPicks as any,
            params.goalsPicks as any,
            params.penaltyPicks as any,
            handle,
            proof,
          ],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to adjust entry",
          variant: "destructive",
        });
        setIsAdjusting(false);
        setIsEncrypting(false);
      }
    },
    [address, writeContract]
  );

  return {
    adjustEntry,
    isAdjusting: isAdjusting || isConfirming,
    isEncrypting,
    isSuccess,
    hash,
  };
}

// Hook to settle league
export function useSettleLeague() {
  const { writeContract, data: hash } = useWriteContract();
  const [isSettling, setIsSettling] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const settleLeague = useCallback(
    (params: {
      leagueId: string;
      winnerResults: number[];
      goalsResults: number[];
      penaltyResults: number[];
    }) => {
      setIsSettling(true);
      try {
        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "settleLeague",
          args: [
            params.leagueId,
            params.winnerResults as any,
            params.goalsResults as any,
            params.penaltyResults as any,
          ],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to settle league",
          variant: "destructive",
        });
        setIsSettling(false);
      }
    },
    [writeContract]
  );

  return {
    settleLeague,
    isSettling: isSettling || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to claim prize
export function useClaimPrize() {
  const { writeContract, data: hash } = useWriteContract();
  const [isClaiming, setIsClaiming] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimPrize = useCallback(
    (params: { leagueId: string; abiEncoded: `0x${string}`; signatures: `0x${string}` }) => {
      setIsClaiming(true);
      try {
        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "claimPrize",
          args: [params.leagueId, params.abiEncoded, params.signatures],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to claim prize",
          variant: "destructive",
        });
        setIsClaiming(false);
      }
    },
    [writeContract]
  );

  return {
    claimPrize,
    isClaiming: isClaiming || isConfirming,
    isSuccess,
    hash,
  };
}

// Hook to claim refund
export function useClaimRefund() {
  const { writeContract, data: hash } = useWriteContract();
  const [isClaiming, setIsClaiming] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimRefund = useCallback(
    (leagueId: string) => {
      setIsClaiming(true);
      try {
        writeContract({
          address: MATCHDAY_ADDRESS,
          abi: MATCHDAY_ABI,
          functionName: "claimRefund",
          args: [leagueId],
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to claim refund",
          variant: "destructive",
        });
        setIsClaiming(false);
      }
    },
    [writeContract]
  );

  return {
    claimRefund,
    isClaiming: isClaiming || isConfirming,
    isSuccess,
    hash,
  };
}
