import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying InterestRate...");

    const InterestRate = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRate.deploy();

    const interestRateAddr = await interestRate.getAddress();
    console.log("InterestRate deployed to:", interestRateAddr);

    console.log("Wait to verify contract...");

    // Đợi 60 giây để Etherscan nhận contract
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000));

    try {
        await run("verify:verify", {
            address: interestRateAddr,
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