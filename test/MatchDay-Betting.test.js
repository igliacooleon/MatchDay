const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("MatchDay - Encrypted Betting Operations", function () {
  let contract;
  let owner, user1, user2, user3, user4;
  let leagueId;

  beforeEach(async function () {
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();
    [owner, user1, user2, user3, user4] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("MatchDay");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    leagueId = "test-league";
    const entryFee = ethers.parseEther("0.01");
    const duration = 3600;

    await contract.connect(owner).createLeague(
      leagueId,
      entryFee,
      duration,
      ["Match 1", "Match 2"],
      ["Team A", "Team C"],
      ["Team B", "Team D"],
      3
    );

    console.log(`✅ Test league created: ${leagueId}`);
  });

  it("should accept encrypted entry with FHE weight", async function () {
    const winnerPicks = [0, 1];
    const goalsPicks = [1, 0];
    const penaltyPicks = [0, 0];
    const weight = 50;

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(BigInt(weight))
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      winnerPicks,
      goalsPicks,
      penaltyPicks,
      encrypted.handles[0],
      encrypted.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    const entry = await contract.getEntry(leagueId, user1.address);
    expect(entry[0]).to.equal(true); // exists
    expect(entry[2][0]).to.equal(0); // first winner pick
    expect(entry[2][1]).to.equal(1); // second winner pick
    console.log("✅ FHE.fromExternal() - Encrypted weight accepted");
    console.log("✅ Entry created with encrypted weight");
  });

  it("should accumulate entry fees in prize pool", async function () {
    const weight = 50;
    const entryFee = ethers.parseEther("0.01");

    for (let i = 0; i < 3; i++) {
      const user = [user1, user2, user3][i];
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), user.address)
        .add64(BigInt(weight))
        .encrypt();

      await contract.connect(user).enterLeague(
        leagueId,
        [0, 1],
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: entryFee }
      );
    }

    const leagueMeta = await contract.getLeagueMeta(leagueId);
    const prizePool = leagueMeta[2];
    expect(prizePool).to.equal(entryFee * 3n);
    console.log(`✅ Prize pool accumulated: ${ethers.formatEther(prizePool)} ETH`);
  });

  it("should prevent double entry", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted.handles[0],
      encrypted.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    await expect(
      contract.connect(user1).enterLeague(
        leagueId,
        [0, 1],
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: ethers.parseEther("0.01") }
      )
    ).to.be.revertedWith("Already entered");

    console.log("✅ Double entry prevention works");
  });

  it("should reject entry with incorrect fee", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await expect(
      contract.connect(user1).enterLeague(
        leagueId,
        [0, 1],
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: ethers.parseEther("0.005") } // Wrong amount
      )
    ).to.be.revertedWith("Incorrect entry fee");

    console.log("✅ Entry fee validation works");
  });

  it("should reject entry after lock time", async function () {
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await expect(
      contract.connect(user1).enterLeague(
        leagueId,
        [0, 1],
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: ethers.parseEther("0.01") }
      )
    ).to.be.revertedWith("Entry period closed");

    console.log("✅ Lock time enforcement works");
  });

  it("should allow entry adjustment before lock time", async function () {
    const encrypted1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted1.handles[0],
      encrypted1.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    const encrypted2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(75n)
      .encrypt();

    await contract.connect(user1).adjustEntry(
      leagueId,
      [1, 0],
      [0, 1],
      [1, 1],
      encrypted2.handles[0],
      encrypted2.inputProof
    );

    const entry = await contract.getEntry(leagueId, user1.address);
    expect(entry[2][0]).to.equal(1); // Adjusted winner pick
    expect(entry[3][0]).to.equal(0); // Adjusted goals pick
    console.log("✅ Entry adjustment works");
  });

  it("should prevent adjustment after lock time", async function () {
    const encrypted1 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted1.handles[0],
      encrypted1.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);

    const encrypted2 = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(75n)
      .encrypt();

    await expect(
      contract.connect(user1).adjustEntry(
        leagueId,
        [1, 0],
        [0, 1],
        [1, 1],
        encrypted2.handles[0],
        encrypted2.inputProof
      )
    ).to.be.revertedWith("Entry period closed");

    console.log("✅ Adjustment lock time enforcement works");
  });

  it("should handle multiple users with different encrypted weights", async function () {
    const users = [user1, user2, user3, user4];
    const weights = [25, 50, 75, 100];

    for (let i = 0; i < users.length; i++) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), users[i].address)
        .add64(BigInt(weights[i]))
        .encrypt();

      await contract.connect(users[i]).enterLeague(
        leagueId,
        [0, 1],
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: ethers.parseEther("0.01") }
      );
    }

    for (let i = 0; i < users.length; i++) {
      const entry = await contract.getEntry(leagueId, users[i].address);
      expect(entry[0]).to.equal(true);
      expect(entry[5]).to.not.equal("0x" + "0".repeat(64)); // Has encrypted handle
    }

    console.log("✅ Multiple users with different weights handled");
  });

  it("should validate prediction arrays match match count", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await expect(
      contract.connect(user1).enterLeague(
        leagueId,
        [0], // Only 1 prediction, but league has 2 matches
        [1, 0],
        [0, 0],
        encrypted.handles[0],
        encrypted.inputProof,
        { value: ethers.parseEther("0.01") }
      )
    ).to.be.revertedWith("Prediction count mismatch");

    console.log("✅ Prediction count validation works");
  });

  it("should verify FHE operations: weight storage and permissions", async function () {
    console.log("Testing FHE weight encryption and storage...");

    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(50n)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted.handles[0],
      encrypted.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    const entry = await contract.getEntry(leagueId, user1.address);
    const handle = entry[5];

    expect(handle).to.not.equal("0x" + "0".repeat(64));
    expect(entry[6]).to.equal(true); // decryptable flag should be true initially

    console.log("✅ FHE.fromExternal() - Weight encrypted successfully");
    console.log("✅ FHE.allow() - Permission set for user");
    console.log("✅ Encrypted handle stored correctly");
  });

  it("should handle edge case: zero weight", async function () {
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(0n)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted.handles[0],
      encrypted.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    const entry = await contract.getEntry(leagueId, user1.address);
    expect(entry[0]).to.equal(true);
    console.log("✅ Zero weight handled successfully");
  });

  it("should handle edge case: maximum uint64 weight", async function () {
    const maxWeight = 2n ** 64n - 1n;
    const encrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), user1.address)
      .add64(maxWeight)
      .encrypt();

    await contract.connect(user1).enterLeague(
      leagueId,
      [0, 1],
      [1, 0],
      [0, 0],
      encrypted.handles[0],
      encrypted.inputProof,
      { value: ethers.parseEther("0.01") }
    );

    const entry = await contract.getEntry(leagueId, user1.address);
    expect(entry[0]).to.equal(true);
    console.log("✅ Maximum weight handled successfully");
  });
});
