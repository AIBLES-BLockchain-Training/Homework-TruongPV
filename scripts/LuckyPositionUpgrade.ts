import * as dotenv from "dotenv";
import { ethers, upgrades, run } from "hardhat";
dotenv.config();

async function main() {
  await run("compile");
  console.log("Compiled contracts...");

  console.log("Upgrade UUPS");

  const proxyAddr = "0x9e3ab306f3BAEf2d82cDC1947e69656Da348E0C2";
  const Lucky = await ethers.getContractFactory("Lucky");
  
  const luckyUpgrade = await upgrades.upgradeProxy(
    proxyAddr,
    Lucky
  );

  await luckyUpgrade.waitForDeployment();
  console.log("Waiting for 5 confirmations...");
  await luckyUpgrade.deploymentTransaction()?.wait(5);

  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);

  console.log("Contract upgrade to new implemention: ", implAddr);
  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });

  await run("verify:verify", {
    address: implAddr,
    constructorArgs: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });