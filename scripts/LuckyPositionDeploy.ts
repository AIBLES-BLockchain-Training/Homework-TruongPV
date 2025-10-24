import { ethers, upgrades, run } from "hardhat";

async function main() {
  await run("compile");
  console.log("Compiled contract...");
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  console.log("Deploying Lucky...");
  const vrfCoordinator = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
  const keyHash =
    "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const subscriptionId =
    "64531828442044787297772928035852315864787473162091229330726461746705040490717";
  const allowedToken = "0x3Fd4829B91BAdc9B8ad0C3da4fC52bFAD174a73c";
  const dateTimeContract = "0x3Fd4829B91BAdc9B8ad0C3da4fC52bFAD174a73c";

  const constructorArgs: [string, string, string, string, string] = [
    vrfCoordinator,
    keyHash,
    subscriptionId,
    allowedToken,
    dateTimeContract,
  ];

  const Lucky = await ethers.getContractFactory("Lucky");
  const lucky = await upgrades.deployProxy(Lucky, constructorArgs, {
    kind: "uups",
    initializer: "initialize",
  });
  await lucky.waitForDeployment();

  const proxyAddr = await lucky.getAddress();
  console.log("Lucky deployed at: ", proxyAddr);
  const owner = await lucky.owner();
  console.log("Owner address:", owner);

  console.log("Wait to verify contract");
  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddr
  );
  await run("verify:verify", {
    address: implementationAddress,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
