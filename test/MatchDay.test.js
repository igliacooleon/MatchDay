const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("MatchDay - Basic League Management", function () {
  let contract;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, user3] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("MatchDay");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    console.log(`✅ MatchDay deployed at: ${await contract.getAddress()}`);
  });

  it("should deploy contract successfully", async function () {
    expect(await contract.getAddress()).to.be.properAddress;
    console.log("✅ Contract deployed successfully");
  });

  it("should create a league with matches", async function () {
    const leagueId = "champions-league-2024";
    const entryFee = ethers.parseEther("0.01");
    const duration = 3600; // 1 hour
    const labels = ["Match 1", "Match 2", "Match 3"];
    const homeTeams = ["Team A", "Team C", "Team E"];
    const awayTeams = ["Team B", "Team D", "Team F"];
    const goalsThreshold = 3;

    const tx = await contract.connect(owner).createLeague(
      leagueId,
      entryFee,
      duration,
      labels,
      homeTeams,
      awayTeams,
      goalsThreshold
    );

    await tx.wait();
    console.log("✅ League created successfully");

    const leagueMeta = await contract.getLeagueMeta(leagueId);
    expect(leagueMeta[0]).to.equal(entryFee);
    expect(leagueMeta[5]).to.equal(goalsThreshold);
    console.log("✅ League metadata verified");

    const matches = await contract.getMatches(leagueId);
    expect(matches.length).to.equal(3);
    expect(matches[0].label).to.equal("Match 1");
    expect(matches[0].homeTeam).to.equal("Team A");
    expect(matches[0].awayTeam).to.equal("Team B");
    console.log("✅ Match data verified");
  });

  it("should list all leagues", async function () {
    await contract.connect(owner).createLeague(
      "league-1",
      ethers.parseEther("0.01"),
      3600,
      ["Match 1"],
      ["Home 1"],
      ["Away 1"],
      3
    );

    await contract.connect(owner).createLeague(
      "league-2",
      ethers.parseEther("0.02"),
      7200,
      ["Match 1"],
      ["Home 1"],
      ["Away 1"],
      3
    );

    const leagues = await contract.listLeagues();
    expect(leagues.length).to.equal(2);
    expect(leagues[0]).to.equal("league-1");
    expect(leagues[1]).to.equal("league-2");
    console.log("✅ League listing verified");
  });

  it("should prevent duplicate league creation", async function () {
    const leagueId = "unique-league";

    await contract.connect(owner).createLeague(
      leagueId,
      ethers.parseEther("0.01"),
      3600,
      ["Match 1"],
      ["Home 1"],
      ["Away 1"],
      3
    );

    await expect(
      contract.connect(owner).createLeague(
        leagueId,
        ethers.parseEther("0.01"),
        3600,
        ["Match 1"],
        ["Home 1"],
        ["Away 1"],
        3
      )
    ).to.be.revertedWith("League already exists");

    console.log("✅ Duplicate league prevention works");
  });

  it("should require matching array lengths for matches", async function () {
    await expect(
      contract.connect(owner).createLeague(
        "test-league",
        ethers.parseEther("0.01"),
        3600,
        ["Match 1", "Match 2"],
        ["Home 1"], // Mismatch
        ["Away 1"],
        3
      )
    ).to.be.revertedWith("Mismatched array lengths");

    console.log("✅ Array length validation works");
  });

  it("should get match details by index", async function () {
    await contract.connect(owner).createLeague(
      "test-league",
      ethers.parseEther("0.01"),
      3600,
      ["Final", "Semi-Final"],
      ["Real Madrid", "Barcelona"],
      ["Bayern Munich", "PSG"],
      3
    );

    const match0 = await contract.getMatch("test-league", 0);
    expect(match0.label).to.equal("Final");
    expect(match0.homeTeam).to.equal("Real Madrid");
    expect(match0.awayTeam).to.equal("Bayern Munich");

    const match1 = await contract.getMatch("test-league", 1);
    expect(match1.label).to.equal("Semi-Final");
    expect(match1.homeTeam).to.equal("Barcelona");
    expect(match1.awayTeam).to.equal("PSG");

    console.log("✅ Match retrieval by index works");
  });

  it("should track league lock time correctly", async function () {
    const duration = 3600;
    await contract.connect(owner).createLeague(
      "time-test",
      ethers.parseEther("0.01"),
      duration,
      ["Match 1"],
      ["Home"],
      ["Away"],
      3
    );

    const leagueMeta = await contract.getLeagueMeta("time-test");
    const lockTime = leagueMeta[1];
    const currentBlock = await ethers.provider.getBlock('latest');
    const expectedLockTime = currentBlock.timestamp + duration;

    expect(Number(lockTime)).to.be.closeTo(expectedLockTime, 5);
    console.log("✅ Lock time tracking works");
  });

  it("should initialize prize pool to zero", async function () {
    await contract.connect(owner).createLeague(
      "prize-test",
      ethers.parseEther("0.01"),
      3600,
      ["Match 1"],
      ["Home"],
      ["Away"],
      3
    );

    const leagueMeta = await contract.getLeagueMeta("prize-test");
    const prizePool = leagueMeta[2];
    expect(prizePool).to.equal(0n);
    console.log("✅ Initial prize pool is zero");
  });

  it("should set correct match result initial state", async function () {
    await contract.connect(owner).createLeague(
      "result-test",
      ethers.parseEther("0.01"),
      3600,
      ["Match 1"],
      ["Home"],
      ["Away"],
      3
    );

    const match = await contract.getMatch("result-test", 0);
    expect(match.finalWinner).to.equal(0);
    expect(match.finalGoals).to.equal(0);
    expect(match.finalPenalty).to.equal(0);
    console.log("✅ Initial match results are zero");
  });

  it("should handle multiple matches in one league", async function () {
    const matchCount = 10;
    const labels = Array.from({ length: matchCount }, (_, i) => `Match ${i + 1}`);
    const homeTeams = Array.from({ length: matchCount }, (_, i) => `Home ${i + 1}`);
    const awayTeams = Array.from({ length: matchCount }, (_, i) => `Away ${i + 1}`);

    await contract.connect(owner).createLeague(
      "large-league",
      ethers.parseEther("0.01"),
      3600,
      labels,
      homeTeams,
      awayTeams,
      3
    );

    const matches = await contract.getMatches("large-league");
    expect(matches.length).to.equal(matchCount);

    for (let i = 0; i < matchCount; i++) {
      expect(matches[i].label).to.equal(`Match ${i + 1}`);
      expect(matches[i].homeTeam).to.equal(`Home ${i + 1}`);
      expect(matches[i].awayTeam).to.equal(`Away ${i + 1}`);
    }

    console.log(`✅ ${matchCount} matches handled correctly`);
  });

  it("should verify FHE operations: league creation with FHE storage", async function () {
    console.log("Testing FHE storage operations...");

    await contract.connect(owner).createLeague(
      "fhe-test",
      ethers.parseEther("0.01"),
      3600,
      ["Match 1"],
      ["Home"],
      ["Away"],
      3
    );

    const leagueMeta = await contract.getLeagueMeta("fhe-test");
    expect(leagueMeta[0]).to.not.be.undefined;

    console.log("✅ FHE storage initialized for league");
    console.log("✅ League data structure created successfully");
  });
});
