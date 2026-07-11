import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment on Base Mainnet...");

  // 1. Deploy GMBadge
  const GMBadge = await ethers.getContractFactory("GMBadge");
  const gmBadge = await GMBadge.deploy();
  await gmBadge.waitForDeployment();
  const gmBadgeAddress = await gmBadge.getAddress();
  console.log(`GMBadge contract successfully deployed to: ${gmBadgeAddress}`);

  // 2. Deploy GMStreak
  const GMStreak = await ethers.getContractFactory("GMStreak");
  const gmStreak = await GMStreak.deploy(gmBadgeAddress);
  await gmStreak.waitForDeployment();
  const gmStreakAddress = await gmStreak.getAddress();
  console.log(`GMStreak contract successfully deployed to: ${gmStreakAddress}`);

  // 3. Link contracts (Set GMStreak contract address in GMBadge)
  console.log("Setting GMStreak contract address in GMBadge...");
  const tx = await gmBadge.setGMStreakContract(gmStreakAddress);
  await tx.wait();
  console.log("GMStreak contract address configured in GMBadge successfully!");

  console.log("\n==============================================");
  console.log("Deployment Summary:");
  console.log("==============================================");
  console.log(`GMBadge: ${gmBadgeAddress}`);
  console.log(`GMStreak: ${gmStreakAddress}`);
  console.log("==============================================");

  console.log("\nVerification commands:");
  console.log(`npx hardhat verify --network base ${gmBadgeAddress}`);
  console.log(`npx hardhat verify --network base ${gmStreakAddress} ${gmBadgeAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
