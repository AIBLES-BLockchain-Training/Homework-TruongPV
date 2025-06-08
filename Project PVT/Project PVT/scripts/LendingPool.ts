import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying LendingPool...");

    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy();

    const lendingPoolAddr = await lendingPool.getAddress();
    console.log("LendingPool deployed to:", lendingPoolAddr);

    console.log("Wait to verify contract...");

    // Đợi 60 giây để Etherscan nhận contract
await new Promise((resolve) => setTimeout(resolve, 180 * 1000));

    try {
        await run("verify:verify", {
            address: lendingPoolAddr,
            constructorArgs: [],
        });
        console.log("Contract verified successfully!");
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified.");
        } else {
            console.error("Verification failed:", error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });