require("@nomicfoundation/hardhat-toolbox");

// Load .env only if it exists (needed for Sepolia deployment)
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed – that's fine for local Hardhat usage
}

const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_SEPOLIA_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: ALCHEMY_SEPOLIA_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
};
