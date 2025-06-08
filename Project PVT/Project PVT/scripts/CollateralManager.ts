import { ethers, run } from "hardhat";

async function main() {
    // Compile hợp đồng
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying CollateralManager...");

    // Lấy factory và triển khai contract
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy();

    // Lấy địa chỉ của contract đã triển khai
    const collateralManagerAddr = await collateralManager.getAddress();
    console.log("CollateralManager deployed to:", collateralManagerAddr);

    console.log("Wait to verify contract...");

    // Chờ 60 giây để đảm bảo hợp đồng đã được ghi nhận trên mạng
    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });

    // Xác minh hợp đồng trên Etherscan
    try {
        await run("verify:verify", {
            address: collateralManagerAddr,
            constructorArgs: [], // Thay [] bằng danh sách tham số nếu hợp đồng có constructor
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

// Gọi hàm chính và xử lý lỗi
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
