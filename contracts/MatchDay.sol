// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MatchDay
 * @notice Share-style encrypted prediction league for football fixtures. Users predict match winner,
 *         total goals (Over/Under) and penalty shootout (Yes/No) with a single encrypted weight per entry.
 *         No admins/oracles are required: settlement uses block randomness or supplied outcomes, and winners
 *         claim by submitting their self-hosted decrypt proof.
 */
contract MatchDay is ZamaEthereumConfig {
    enum BetType {
        Winner,
        Goals,
        Penalty
    }

    struct MarketExposure {
        euint64 optionA; // For Winner: home team, Goals: Under, Penalty: No
        euint64 optionB; // For Winner: away team, Goals: Over, Penalty: Yes
        uint256 picksA;
        uint256 picksB;
    }

    struct MatchRound {
        string label;
        string homeTeam;
        string awayTeam;
        MarketExposure winner;
        MarketExposure goals;
        MarketExposure penalty;
        uint8 finalWinner;
        uint8 finalGoals; // 0 = under threshold, 1 = over
        uint8 finalPenalty; // 0 = no penalties, 1 = penalties
    }

    struct League {
        bool exists;
        string leagueId;
        address creator;
        uint256 entryFee;
        uint256 lockTime;
        uint256 prizePool;
        bool cancelled;
        bool settled;
        uint8 goalsThreshold;
        MatchRound[] matches;
        address[] entrants;
        uint256 winnerCount;
        bool pushAll;
    }

    struct Entry {
        bool exists;
        bool claimed;
        uint8[] winnerPicks;
        uint8[] goalsPicks;
        uint8[] penaltyPicks;
        euint64 weightCipher;
        bytes32 ciphertextHandle;
        bool decryptable;
    }

    mapping(string => League) private leagues;
    mapping(string => mapping(address => Entry)) private entries;
    string[] private leagueIds;

    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    uint256 public constant MIN_DURATION = 30 minutes;
    uint256 public constant MAX_DURATION = 14 days;
    uint8 public constant MIN_MATCHES = 1;
    uint8 public constant MAX_MATCHES = 8;

    event LeagueCreated(string indexed leagueId, uint8 matchCount, uint256 lockTime, uint8 goalsThreshold);
    event EntrySubmitted(string indexed leagueId, address indexed player);
    event EntryAdjusted(string indexed leagueId, address indexed player);
    event LeagueSettled(string indexed leagueId, bool pushAll, uint256 winnerCount);
    event LeagueCancelled(string indexed leagueId);
    event PrizeClaimed(string indexed leagueId, address indexed player, uint256 amount);
    event RefundClaimed(string indexed leagueId, address indexed player, uint256 amount);

    error LeagueExists();
    error LeagueMissing();
    error InvalidMatchConfig();
    error InvalidFee();
    error InvalidDuration();
    error InvalidPick();
    error AlreadyEntered();
    error EntryMissing();
    error Locked();
    error NotSettled();
    error NotWinner();
    error AlreadyClaimed();
    error NotRefundable();
    error NotDecryptable();

    /** ---------------------- Creation ---------------------- */

    function createLeague(
        string calldata leagueId,
        uint256 entryFee,
        uint256 duration,
        string[] calldata labels,
        string[] calldata homeTeams,
        string[] calldata awayTeams,
        uint8 goalsThreshold
    ) external {
        if (leagues[leagueId].exists) revert LeagueExists();
        if (entryFee < MIN_ENTRY_FEE) revert InvalidFee();
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();
        if (
            labels.length < MIN_MATCHES ||
            labels.length > MAX_MATCHES ||
            labels.length != homeTeams.length ||
            labels.length != awayTeams.length
        ) revert InvalidMatchConfig();

        League storage league = leagues[leagueId];
        league.exists = true;
        league.leagueId = leagueId;
        league.creator = msg.sender;
        league.entryFee = entryFee;
        league.lockTime = block.timestamp + duration;
        league.goalsThreshold = goalsThreshold;

        for (uint256 i = 0; i < labels.length; i++) {
            MatchRound storage matchRound = league.matches.push();
            matchRound.label = labels[i];
            matchRound.homeTeam = homeTeams[i];
            matchRound.awayTeam = awayTeams[i];
            matchRound.winner.optionA = FHE.asEuint64(0);
            matchRound.winner.optionB = FHE.asEuint64(0);
            matchRound.goals.optionA = FHE.asEuint64(0);
            matchRound.goals.optionB = FHE.asEuint64(0);
            matchRound.penalty.optionA = FHE.asEuint64(0);
            matchRound.penalty.optionB = FHE.asEuint64(0);
            FHE.allowThis(matchRound.winner.optionA);
            FHE.allowThis(matchRound.winner.optionB);
            FHE.allowThis(matchRound.goals.optionA);
            FHE.allowThis(matchRound.goals.optionB);
            FHE.allowThis(matchRound.penalty.optionA);
            FHE.allowThis(matchRound.penalty.optionB);
        }

        leagueIds.push(leagueId);
        emit LeagueCreated(leagueId, uint8(labels.length), league.lockTime, goalsThreshold);
    }

    /** ---------------------- Participation ---------------------- */

    function enterLeague(
        string calldata leagueId,
        uint8[] calldata winnerPicks,
        uint8[] calldata goalsPicks,
        uint8[] calldata penaltyPicks,
        externalEuint64 encryptedWeight,
        bytes calldata proof
    ) external payable {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        if (league.cancelled) revert Locked();
        if (block.timestamp >= league.lockTime) revert Locked();
        uint256 matchCount = league.matches.length;
        if (
            winnerPicks.length != matchCount ||
            goalsPicks.length != matchCount ||
            penaltyPicks.length != matchCount
        ) revert InvalidPick();
        if (msg.value != league.entryFee) revert InvalidFee();

        Entry storage entry = entries[leagueId][msg.sender];
        if (entry.exists) revert AlreadyEntered();

        euint64 weight = FHE.fromExternal(encryptedWeight, proof);
        entry.exists = true;
        entry.claimed = false;
        entry.weightCipher = weight;
        entry.ciphertextHandle = FHE.toBytes32(weight);
        entry.decryptable = false;
        _copyPicks(entry, winnerPicks, goalsPicks, penaltyPicks);
        _applyAllExposures(league, entry, true);
        FHE.allow(weight, msg.sender);

        league.prizePool += msg.value;
        league.entrants.push(msg.sender);

        emit EntrySubmitted(leagueId, msg.sender);
    }

    function adjustEntry(
        string calldata leagueId,
        uint8[] calldata newWinnerPicks,
        uint8[] calldata newGoalsPicks,
        uint8[] calldata newPenaltyPicks,
        externalEuint64 newEncryptedWeight,
        bytes calldata proof
    ) external {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        if (league.cancelled) revert Locked();
        if (block.timestamp >= league.lockTime) revert Locked();

        Entry storage entry = entries[leagueId][msg.sender];
        if (!entry.exists) revert EntryMissing();
        uint256 matchCount = league.matches.length;
        if (
            newWinnerPicks.length != matchCount ||
            newGoalsPicks.length != matchCount ||
            newPenaltyPicks.length != matchCount
        ) revert InvalidPick();

        _applyAllExposures(league, entry, false);

        euint64 newWeight = FHE.fromExternal(newEncryptedWeight, proof);
        entry.weightCipher = newWeight;
        entry.ciphertextHandle = FHE.toBytes32(newWeight);
        entry.claimed = false;
        entry.decryptable = false;
        _copyPicks(entry, newWinnerPicks, newGoalsPicks, newPenaltyPicks);
        _applyAllExposures(league, entry, true);
        FHE.allow(newWeight, msg.sender);

        emit EntryAdjusted(leagueId, msg.sender);
    }

    /** ---------------------- Decryption helpers ---------------------- */

    function makeEntryDecryptable(string calldata leagueId) external {
        Entry storage entry = entries[leagueId][msg.sender];
        if (!entry.exists) revert EntryMissing();
        entry.weightCipher = FHE.makePubliclyDecryptable(entry.weightCipher);
        entry.ciphertextHandle = FHE.toBytes32(entry.weightCipher);
        entry.decryptable = true;
    }

    /** ---------------------- Settlement ---------------------- */

    function settleLeague(string calldata leagueId) external {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        if (league.cancelled) revert Locked();
        if (block.timestamp < league.lockTime) revert Locked();
        if (league.settled) revert Locked();

        uint256 matchCount = league.matches.length;
        uint256 winners;
        for (uint256 i = 0; i < matchCount; i++) {
            bytes32 seed = keccak256(abi.encode(blockhash(block.number - 1), leagueId, i));
            MatchRound storage matchRound = league.matches[i];
            matchRound.finalWinner = uint8(uint256(seed) % 2);
            matchRound.finalGoals = uint8((uint256(seed) >> 2) % 2);
            matchRound.finalPenalty = uint8((uint256(seed) >> 4) % 2);
        }

        for (uint256 i = 0; i < league.entrants.length; i++) {
            Entry storage entry = entries[leagueId][league.entrants[i]];
            if (_isWinningEntry(entry, league.matches)) {
                winners += 1;
            }
        }

        league.winnerCount = winners;
        league.pushAll = (winners == 0);
        league.settled = true;

        emit LeagueSettled(leagueId, league.pushAll, winners);
    }

    function cancelLeague(string calldata leagueId) external {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        require(msg.sender == league.creator, "Only creator");
        if (league.settled) revert Locked();
        league.cancelled = true;
        emit LeagueCancelled(leagueId);
    }

    /** ---------------------- Claims ---------------------- */

    function claimPrize(
        string calldata leagueId,
        bytes calldata clearValue,
        bytes calldata proof
    ) external {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        if (!league.settled || league.cancelled || league.pushAll) revert NotSettled();

        Entry storage entry = entries[leagueId][msg.sender];
        if (!entry.exists) revert EntryMissing();
        if (entry.claimed) revert AlreadyClaimed();
        if (!entry.decryptable) revert NotDecryptable();

        bytes32[] memory handles = new bytes32[](1);
        handles[0] = entry.ciphertextHandle;
        FHE.checkSignatures(handles, clearValue, proof);

        bool win = _isWinningEntry(entry, league.matches);
        if (!win) revert NotWinner();

        uint256 winners = league.winnerCount;
        require(winners > 0, "No winners");
        uint256 payout = league.prizePool / winners;

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: payout }("");
        require(sent, "transfer failed");

        emit PrizeClaimed(leagueId, msg.sender, payout);
    }

    function claimRefund(string calldata leagueId) external {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();

        Entry storage entry = entries[leagueId][msg.sender];
        if (!entry.exists) revert EntryMissing();
        if (entry.claimed) revert AlreadyClaimed();

        bool refundable = league.cancelled || (league.settled && league.pushAll);
        if (!refundable) revert NotRefundable();

        entry.claimed = true;
        (bool sent, ) = payable(msg.sender).call{ value: league.entryFee }("");
        require(sent, "refund failed");

        emit RefundClaimed(leagueId, msg.sender, league.entryFee);
    }

    /** ---------------------- Views ---------------------- */

    function listLeagues() external view returns (string[] memory) {
        return leagueIds;
    }

    function getLeagueMeta(string calldata leagueId)
        external
        view
        returns (
            uint256 entryFee,
            uint256 lockTime,
            uint256 prizePool,
            bool cancelled,
            bool settled,
            uint8 goalsThreshold
        )
    {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        return (league.entryFee, league.lockTime, league.prizePool, league.cancelled, league.settled, league.goalsThreshold);
    }

    function getMatches(string calldata leagueId) external view returns (MatchRound[] memory) {
        League storage league = leagues[leagueId];
        if (!league.exists) revert LeagueMissing();
        MatchRound[] memory rounds = new MatchRound[](league.matches.length);
        for (uint256 i = 0; i < league.matches.length; i++) {
            rounds[i] = league.matches[i];
        }
        return rounds;
    }

    function getEntry(string calldata leagueId, address user)
        external
        view
        returns (
            bool exists,
            bool claimed,
            uint8[] memory winnerPicks,
            uint8[] memory goalsPicks,
            uint8[] memory penaltyPicks,
            bytes32 handle,
            bool decryptable
        )
    {
        Entry storage entry = entries[leagueId][user];
        if (!entry.exists) {
            return (false, false, new uint8[](0), new uint8[](0), new uint8[](0), bytes32(0), false);
        }
        return (entry.exists, entry.claimed, entry.winnerPicks, entry.goalsPicks, entry.penaltyPicks, entry.ciphertextHandle, entry.decryptable);
    }

    /** ---------------------- Internal helpers ---------------------- */

    function _copyPicks(
        Entry storage entry,
        uint8[] memory winnerPicks,
        uint8[] memory goalsPicks,
        uint8[] memory penaltyPicks
    ) internal {
        delete entry.winnerPicks;
        delete entry.goalsPicks;
        delete entry.penaltyPicks;
        for (uint256 i = 0; i < winnerPicks.length; i++) {
            entry.winnerPicks.push(winnerPicks[i]);
            entry.goalsPicks.push(goalsPicks[i]);
            entry.penaltyPicks.push(penaltyPicks[i]);
        }
    }

    function _applyAllExposures(League storage league, Entry storage entry, bool add) internal {
        for (uint256 i = 0; i < league.matches.length; i++) {
            uint8 winnerPick = entry.winnerPicks[i];
            uint8 goalsPick = entry.goalsPicks[i];
            uint8 penaltyPick = entry.penaltyPicks[i];
            MatchRound storage matchRound = league.matches[i];
            _applyExposure(matchRound.winner, winnerPick, entry.weightCipher, add);
            _applyExposure(matchRound.goals, goalsPick, entry.weightCipher, add);
            _applyExposure(matchRound.penalty, penaltyPick, entry.weightCipher, add);
        }
    }

    function _applyExposure(
        MarketExposure storage market,
        uint8 pick,
        euint64 weight,
        bool add
    ) internal {
        if (pick > 1) revert InvalidPick();
        if (pick == 0) {
            market.optionA = add ? FHE.add(market.optionA, weight) : FHE.sub(market.optionA, weight);
            market.picksA = add ? market.picksA + 1 : market.picksA - 1;
            FHE.allowThis(market.optionA);
        } else {
            market.optionB = add ? FHE.add(market.optionB, weight) : FHE.sub(market.optionB, weight);
            market.picksB = add ? market.picksB + 1 : market.picksB - 1;
            FHE.allowThis(market.optionB);
        }
    }

    function _isWinningEntry(Entry storage entry, MatchRound[] storage matches) internal view returns (bool) {
        if (!entry.exists) return false;
        for (uint256 i = 0; i < matches.length; i++) {
            MatchRound storage matchRound = matches[i];
            if (
                entry.winnerPicks[i] != matchRound.finalWinner ||
                entry.goalsPicks[i] != matchRound.finalGoals ||
                entry.penaltyPicks[i] != matchRound.finalPenalty
            ) {
                return false;
            }
        }
        return true;
    }
}
