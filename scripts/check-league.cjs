const hre = require("hardhat");

async function main() {
  const contractAddress = "0xc1eb59c1AdC331d6AFC5B73b18DEBCC0E5439805";
  const leagueId = "premier-league-weekend-001";

  console.log("Checking league data...");
  console.log("Contract:", contractAddress);
  console.log("League ID:", leagueId);

  const MatchDay = await hre.ethers.getContractAt("MatchDay", contractAddress);

  try {
    const league = await MatchDay.getLeague(leagueId);
    console.log("\n✅ League data:");
    console.log("Exists:", league.exists);
    console.log("Creator:", league.creator);
    console.log("Entry Fee:", hre.ethers.formatEther(league.entryFee), "ETH");
    console.log("Lock Time:", new Date(Number(league.lockTime) * 1000).toLocaleString());
    console.log("Prize Pool:", hre.ethers.formatEther(league.prizePool), "ETH");
    console.log("Cancelled:", league.cancelled);
    console.log("Settled:", league.settled);
    console.log("Goals Threshold:", league.goalsThreshold);

    const matchCount = await MatchDay.getMatchCount(leagueId);
    console.log("\nMatch Count:", matchCount.toString());
  } catch (error) {
    console.error("\n❌ Error reading league:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
