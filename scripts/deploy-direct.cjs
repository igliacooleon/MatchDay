const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  // Setup provider and wallet
  const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
  const privateKey = "0x4cbdb8fad70b3931172c5409bf6827c6590ae3c23e13e8278310af57916e02a6";

  console.log("Deploying MatchDay contract with ethers.js...");
  console.log("RPC URL:", rpcUrl);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deployer address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Load compiled contract
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MatchDay.sol/MatchDay.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log("\nDeploying contract...");

  // Create contract factory and deploy
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();

  console.log("Transaction sent:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation...");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ MatchDay deployed to:", contractAddress);

  // Test contract by calling a view function
  console.log("\nTesting contract...");
  try {
    const minEntryFee = await contract.MIN_ENTRY_FEE();
    const minDuration = await contract.MIN_DURATION();
    const maxDuration = await contract.MAX_DURATION();
    const minRounds = await contract.MIN_ROUNDS();
    const maxRounds = await contract.MAX_ROUNDS();

    console.log("\n✅ Contract is working!");
    console.log("MIN_ENTRY_FEE:", ethers.formatEther(minEntryFee), "ETH");
    console.log("MIN_DURATION:", minDuration.toString(), "seconds");
    console.log("MAX_DURATION:", maxDuration.toString(), "seconds");
    console.log("MIN_ROUNDS:", minRounds.toString());
    console.log("MAX_ROUNDS:", maxRounds.toString());

    console.log("\n📋 Deployment Summary:");
    console.log("════════════════════════════════════════════");
    console.log("Contract Address:", contractAddress);
    console.log("Network: Sepolia");
    console.log("Deployer:", wallet.address);
    console.log("════════════════════════════════════════════");

    return contractAddress;
  } catch (error) {
    console.error("\n❌ Contract test failed:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("\n✨ Deployment successful!");
    console.log("\nNext steps:");
    console.log("1. Update contract address in frontend files");
    console.log("2. Run: node scripts/create-leagues-direct.cjs");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
