import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
        details: {
          yul: true,
        },
      },
      viaIR: true,
      evmVersion: "paris",
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/05b105b138ff45aabff2029eeb197518", // hoặc Alchemy
      accounts: ["0ac89a8a9bc0b22d495633d781515f0e017771b44a7e9bcff18e27333505e459"] ,
    }
  },
  etherscan: {
    apiKey: "HDFZWSINFYRYHMD1317JUBHJZNCYQ3IICB", 
  },
};

export default config;
