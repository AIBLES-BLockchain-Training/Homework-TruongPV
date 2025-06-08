const hre = require("hardhat");

async function main() {
    const mockTokenAddress = "0xd9202a5745cd2b9c0f5daac25d3a219d79e7d234"; // Địa chỉ MockToken của bạn
    const MockToken = await hre.ethers.getContractFactory("MockToken");
    const mockToken = MockToken.attach(mockTokenAddress);
    const currentOwner = await mockToken.owner();
    console.log("Current MockToken owner:", currentOwner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 