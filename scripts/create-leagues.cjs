const hre = require("hardhat");

async function main() {
  const contractAddress = "0xc1eb59c1AdC331d6AFC5B73b18DEBCC0E5439805";

  console.log("Creating test leagues...");
  console.log("Contract:", contractAddress);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const MatchDay = await hre.ethers.getContractAt("MatchDay", contractAddress);

  // League 1: Premier League Weekend
  const league1 = {
    leagueId: "premier-league-weekend-001",
    entryFee: hre.ethers.parseEther("0.001"),
    duration: 7 * 24 * 60 * 60, // 7 days
    labels: ["Match 1", "Match 2", "Match 3"],
    homeTeams: ["Manchester United", "Liverpool", "Arsenal"],
    awayTeams: ["Chelsea", "Manchester City", "Tottenham"],
    goalsThreshold: 3
  };

  console.log("\n📋 Creating League 1: Premier League Weekend");
  const tx1 = await MatchDay.createLeague(
    league1.leagueId,
    league1.entryFee,
    league1.duration,
    league1.labels,
    league1.homeTeams,
    league1.awayTeams,
    league1.goalsThreshold
  );
  await tx1.wait();
  console.log("✅ League created:", league1.leagueId);
  console.log("   Entry Fee:", hre.ethers.formatEther(league1.entryFee), "ETH");
  console.log("   Duration:", league1.duration / (24 * 60 * 60), "days");
  console.log("   Matches:", league1.labels.length);

  // League 2: Champions League Night
  const league2 = {
    leagueId: "champions-league-night-001",
    entryFee: hre.ethers.parseEther("0.002"),
    duration: 5 * 24 * 60 * 60, // 5 days
    labels: ["QF 1", "QF 2", "QF 3", "QF 4"],
    homeTeams: ["Real Madrid", "Bayern Munich", "Barcelona", "PSG"],
    awayTeams: ["Inter Milan", "Dortmund", "Napoli", "AC Milan"],
    goalsThreshold: 3
  };

  console.log("\n📋 Creating League 2: Champions League Night");
  const tx2 = await MatchDay.createLeague(
    league2.leagueId,
    league2.entryFee,
    league2.duration,
    league2.labels,
    league2.homeTeams,
    league2.awayTeams,
    league2.goalsThreshold
  );
  await tx2.wait();
  console.log("✅ League created:", league2.leagueId);
  console.log("   Entry Fee:", hre.ethers.formatEther(league2.entryFee), "ETH");
  console.log("   Duration:", league2.duration / (24 * 60 * 60), "days");
  console.log("   Matches:", league2.labels.length);

  // League 3: La Liga Showdown
  const league3 = {
    leagueId: "la-liga-showdown-001",
    entryFee: hre.ethers.parseEther("0.0015"),
    duration: 10 * 24 * 60 * 60, // 10 days
    labels: ["Round 1", "Round 2", "Round 3", "Round 4", "Round 5"],
    homeTeams: ["Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla", "Valencia"],
    awayTeams: ["Villarreal", "Real Sociedad", "Real Betis", "Athletic Bilbao", "Osasuna"],
    goalsThreshold: 2
  };

  console.log("\n📋 Creating League 3: La Liga Showdown");
  const tx3 = await MatchDay.createLeague(
    league3.leagueId,
    league3.entryFee,
    league3.duration,
    league3.labels,
    league3.homeTeams,
    league3.awayTeams,
    league3.goalsThreshold
  );
  await tx3.wait();
  console.log("✅ League created:", league3.leagueId);
  console.log("   Entry Fee:", hre.ethers.formatEther(league3.entryFee), "ETH");
  console.log("   Duration:", league3.duration / (24 * 60 * 60), "days");
  console.log("   Matches:", league3.labels.length);

  // League 4: Bundesliga Battles
  const league4 = {
    leagueId: "bundesliga-battles-001",
    entryFee: hre.ethers.parseEther("0.001"),
    duration: 3 * 24 * 60 * 60, // 3 days
    labels: ["Match 1", "Match 2"],
    homeTeams: ["Bayern Munich", "Dortmund"],
    awayTeams: ["RB Leipzig", "Bayer Leverkusen"],
    goalsThreshold: 3
  };

  console.log("\n📋 Creating League 4: Bundesliga Battles");
  const tx4 = await MatchDay.createLeague(
    league4.leagueId,
    league4.entryFee,
    league4.duration,
    league4.labels,
    league4.homeTeams,
    league4.awayTeams,
    league4.goalsThreshold
  );
  await tx4.wait();
  console.log("✅ League created:", league4.leagueId);
  console.log("   Entry Fee:", hre.ethers.formatEther(league4.entryFee), "ETH");
  console.log("   Duration:", league4.duration / (24 * 60 * 60), "days");
  console.log("   Matches:", league4.labels.length);

  // League 5: Serie A Classic
  const league5 = {
    leagueId: "serie-a-classic-001",
    entryFee: hre.ethers.parseEther("0.0012"),
    duration: 14 * 24 * 60 * 60, // 14 days
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    homeTeams: ["Juventus", "AC Milan", "Inter Milan", "Napoli"],
    awayTeams: ["Roma", "Lazio", "Atalanta", "Fiorentina"],
    goalsThreshold: 2
  };

  console.log("\n📋 Creating League 5: Serie A Classic");
  const tx5 = await MatchDay.createLeague(
    league5.leagueId,
    league5.entryFee,
    league5.duration,
    league5.labels,
    league5.homeTeams,
    league5.awayTeams,
    league5.goalsThreshold
  );
  await tx5.wait();
  console.log("✅ League created:", league5.leagueId);
  console.log("   Entry Fee:", hre.ethers.formatEther(league5.entryFee), "ETH");
  console.log("   Duration:", league5.duration / (24 * 60 * 60), "days");
  console.log("   Matches:", league5.labels.length);

  console.log("\n✨ All test leagues created successfully!");
  console.log("\n📊 Summary:");
  console.log("Total leagues created: 5");
  console.log("Total matches: 18");
  console.log("\nLeague IDs:");
  console.log("1. premier-league-weekend-001");
  console.log("2. champions-league-night-001");
  console.log("3. la-liga-showdown-001");
  console.log("4. bundesliga-battles-001");
  console.log("5. serie-a-classic-001");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
