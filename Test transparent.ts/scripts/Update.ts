import { ethers, upgrades, run } from "hardhat";

async function main() {
  // Compile contracts.i
  await run("compile");
  console.log("Compiled contracts...");

  // Deploy
  console.log("Deploying Demo...");

  const constructorArgs: [string, bigint] = [
    "0x266c5F4f9e5D0ca8d9285cD5b2056f5e0a1F231b",
    100n,
  ];

  const DemoUUPS = await ethers.getContractFactory("Demo");

  const demoUUPS = await upgrades.deployProxy(DemoUUPS, constructorArgs, {
    kind: 'transparent', // Điều chỉnh từ 'uups' thành 'transparent'
    initializer: 'initialize'
  });

  await demoUUPS.waitForDeployment();

  const proxyAddr = await demoUUPS.getAddress();
  console.log("Demo deployed at: ", proxyAddr);

  // Thêm đoạn này để lấy địa chỉ ProxyAdmin
  const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(proxyAddr);
  console.log("ProxyAdmin address:", proxyAdminAddress);

  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });

  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);

  await run("verify:verify", {
    address: implAddr,
    constructorArgs: [],
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
