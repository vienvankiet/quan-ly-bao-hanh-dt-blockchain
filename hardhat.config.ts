import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY?.trim() || "";

export default defineConfig({
    plugins: [hardhatToolboxMochaEthers],
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: { enabled: true, runs: 200 },
        },
    },
    paths: {
        sources: "./src/contracts",
        artifacts: "./artifacts",
        cache: "./cache",
        ignition: "./ignition",
    },
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainId: 31337,
        },
        localhost: {
            type: "http",
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
        cronosTestnet: {
            type: "http",
            url: process.env.CRONOS_RPC_URL || "https://evm-t3.cronos.org",
            chainId: 338,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
    },
});
