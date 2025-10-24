import { ethers, run } from "hardhat";

async function main() {
  await run("compile");
  console.log("Compiled MockToken contract...");

  console.log("Deploying MockToken...");
  
  // Lấy deployer address làm initial owner
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const MockToken = await ethers.getContractFactory("MockToken");

  // Deploy contract với deployer làm initial owner
  console.log("Deploying contract...");
  const mockToken = await MockToken.deploy(deployer.address);
  
  await mockToken.waitForDeployment();
  const tokenAddress = await mockToken.getAddress();
  console.log("MockToken deployed at:", tokenAddress);

  // Đợi một chút để transaction được confirm
  console.log("Waiting for deployment confirmation...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Mint một số token ban đầu cho deployer
  const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens
  console.log("Minting initial supply...");
  
  const mintTx = await mockToken.mint(deployer.address, initialSupply);
  await mintTx.wait(); // Đợi transaction được confirm
  
  console.log(`Minted ${ethers.formatUnits(initialSupply, 18)} MTK tokens to deployer`);

  // Đợi thêm một chút trước khi đọc state
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify contract info
  const name = await mockToken.name();
  const symbol = await mockToken.symbol();
  const decimals = await mockToken.decimals();
  const totalSupply = await mockToken.totalSupply();
  const owner = await mockToken.owner();
  const deployerBalance = await mockToken.balanceOf(deployer.address);

  console.log("Contract Details:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Decimals:", decimals.toString());
  console.log("- Total Supply:", ethers.formatUnits(totalSupply, 18));
  console.log("- Owner:", owner);
  console.log("- Deployer Balance:", ethers.formatUnits(deployerBalance, 18));
  console.log("- Transfer Should Fail:", await mockToken.transferShouldFail());

  // Đợi lâu hơn trước khi verify để đảm bảo contract đã được index
  console.log("Waiting for contract to be indexed on Etherscan...");
  await new Promise((resolve) => {
    setTimeout(resolve, 30 * 1000); // Giảm từ 60s xuống 30s
  });

  try {
    console.log("Attempting to verify contract...");
    console.log("Constructor args:", [deployer.address]);
    
    await run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [deployer.address], // Sửa từ constructorArgs thành constructorArguments
    });
    console.log("MockToken contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error);
    
    // Thử verify lại với manual approach
    console.log("Trying alternative verification method...");
    try {
      await run("verify", {
        address: tokenAddress,
        constructorArgsParams: [deployer.address],
      });
      console.log("Alternative verification successful");
    } catch (error2) {
      console.log("Alternative verification also failed:", error2);
    }
  }

  // Contract deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Contract Address:", tokenAddress);
  console.log("Owner Address:", owner);
  console.log("Initial Supply:", ethers.formatUnits(totalSupply, 18), "MTK");
  console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
  console.log("========================\n");

  return {
    mockToken,
    tokenAddress,
    owner: deployer.address,
    totalSupply: totalSupply.toString(),
    deployerBalance: deployerBalance.toString()
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

export default main;