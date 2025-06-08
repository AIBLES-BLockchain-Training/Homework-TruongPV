import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    // Địa chỉ owner khởi tạo, thay bằng địa chỉ ví của bạn nếu cần
    const initialOwner = "0x266c5F4f9e5D0ca8d9285cD5b2056f5e0a1F231b";

    console.log("Deploying MockToken...");

    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy("0x266c5F4f9e5D0ca8d9285cD5b2056f5e0a1F231b");
    await mockToken.waitForDeployment();

    const mockTokenAddr = await mockToken.getAddress();
    console.log("MockToken deployed to:", mockTokenAddr);

    console.log("Wait to verify contract...");

    // Đợi 90 giây để Etherscan nhận contract
    await new Promise((resolve) => setTimeout(resolve, 90 * 1000));

    try {
        await run("verify:verify", {
            address: mockTokenAddr,
            constructorArgs: [initialOwner],
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