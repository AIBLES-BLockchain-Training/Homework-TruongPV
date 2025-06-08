import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying PriceOracle...");

    // Lấy factory và triển khai contract
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    // Lấy địa chỉ của contract đã triển khai
    const priceOracleAddr = await priceOracle.getAddress();
    console.log("PriceOracle deployed to:", priceOracleAddr);

    console.log("Wait to verify contract...");

    // Chờ 60 giây để đảm bảo hợp đồng đã được ghi nhận trên mạng
    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });

    // Xác minh hợp đồng trên Etherscan
    try {
        await run("verify:verify", {
            address: priceOracleAddr,
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

// Gọi hàm chính và xử lý lỗi
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
