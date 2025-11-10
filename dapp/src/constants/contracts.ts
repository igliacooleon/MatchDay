import { Address } from "viem";

// MatchDay contract address - Deployed on Sepolia
export const MATCHDAY_ADDRESS: Address = "0x1C23307182B4C9488E0bB4A32a4c95B58A5f2295";

export const MATCHDAY_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
      {
        internalType: "uint8[]",
        name: "newWinnerPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "newGoalsPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "newPenaltyPicks",
        type: "uint8[]",
      },
      {
        internalType: "externalEuint64",
        name: "newEncryptedWeight",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "adjustEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
    ],
    name: "cancelLeague",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "clearValue",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "claimPrize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
    ],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "duration",
        type: "uint256",
      },
      {
        internalType: "string[]",
        name: "labels",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "homeTeams",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "awayTeams",
        type: "string[]",
      },
      {
        internalType: "uint8",
        name: "goalsThreshold",
        type: "uint8",
      },
    ],
    name: "createLeague",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
      {
        internalType: "uint8[]",
        name: "winnerPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "goalsPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "penaltyPicks",
        type: "uint8[]",
      },
      {
        internalType: "externalEuint64",
        name: "encryptedWeight",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "proof",
        type: "bytes",
      },
    ],
    name: "enterLeague",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getEntry",
    outputs: [
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "claimed",
        type: "bool",
      },
      {
        internalType: "uint8[]",
        name: "winnerPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "goalsPicks",
        type: "uint8[]",
      },
      {
        internalType: "uint8[]",
        name: "penaltyPicks",
        type: "uint8[]",
      },
      {
        internalType: "bytes32",
        name: "handle",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "decryptable",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
    ],
    name: "getLeagueMeta",
    outputs: [
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lockTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "prizePool",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "cancelled",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "settled",
        type: "bool",
      },
      {
        internalType: "uint8",
        name: "goalsThreshold",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
    ],
    name: "getMatches",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "label",
            type: "string",
          },
          {
            internalType: "string",
            name: "homeTeam",
            type: "string",
          },
          {
            internalType: "string",
            name: "awayTeam",
            type: "string",
          },
          {
            components: [
              {
                internalType: "euint64",
                name: "optionA",
                type: "bytes32",
              },
              {
                internalType: "euint64",
                name: "optionB",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "picksA",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "picksB",
                type: "uint256",
              },
            ],
            internalType: "struct MatchDay.MarketExposure",
            name: "winner",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "euint64",
                name: "optionA",
                type: "bytes32",
              },
              {
                internalType: "euint64",
                name: "optionB",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "picksA",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "picksB",
                type: "uint256",
              },
            ],
            internalType: "struct MatchDay.MarketExposure",
            name: "goals",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "euint64",
                name: "optionA",
                type: "bytes32",
              },
              {
                internalType: "euint64",
                name: "optionB",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "picksA",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "picksB",
                "type": "uint256",
              },
            ],
            internalType: "struct MatchDay.MarketExposure",
            name: "penalty",
            type: "tuple",
          },
          {
            internalType: "uint8",
            name: "finalWinner",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "finalGoals",
            type: "uint8",
          },
          {
            internalType: "uint8",
            name: "finalPenalty",
            type: "uint8",
          },
        ],
        internalType: "struct MatchDay.MatchRound[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "listLeagues",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "leagueId",
        type: "string",
      },
    ],
    name: "makeEntryDecryptable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        "name": "leagueId",
        type: "string",
      },
    ],
    name: "settleLeague",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
