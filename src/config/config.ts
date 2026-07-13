import { WarrantyStatus } from "../models/warranty";

// Cap nhat bang lenh: npm run deploy:cronos
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const CHAIN_CONFIG = {
    chainId: "0x152",
    chainName: "Cronos Testnet",
    rpcUrls: ["https://evm-t3.cronos.org"],
    nativeCurrency: { name: "tCRO", symbol: "tCRO", decimals: 18 },
    blockExplorerUrls: ["https://explorer.cronos.org/testnet"],
};

export const CHAIN_ID = 338;

export const MOCK_SEED_DATA = [
    {
        imei: "356789123456789",
        model: "Samsung S24 Ultra",
        owner: "0xA1b2C3d4E5f6789012345678901234567890AbCd",
        activatedAt: Math.floor(Date.now() / 1000) - 30 * 86400,
        expiresAt: Math.floor(Date.now() / 1000) + 335 * 86400,
        status: WarrantyStatus.Active,
    },
    {
        imei: "351234567890123",
        model: "iPhone 16 Pro",
        owner: "0xB2c3D4e5F67890123456789012345678901BcDeF",
        activatedAt: Math.floor(Date.now() / 1000) - 60 * 86400,
        expiresAt: Math.floor(Date.now() / 1000) + 305 * 86400,
        status: WarrantyStatus.Repair,
    },
    {
        imei: "358765432109876",
        model: "Xiaomi 15",
        owner: "0xC3d4E5f678901234567890123456789012CdEf01",
        activatedAt: Math.floor(Date.now() / 1000) - 400 * 86400,
        expiresAt: Math.floor(Date.now() / 1000) - 35 * 86400,
        status: WarrantyStatus.Expired,
    },
    {
        imei: "352345678901234",
        model: "OPPO Find X8",
        owner: "0xD4e5F6789012345678901234567890123dEf0123",
        activatedAt: Math.floor(Date.now() / 1000) - 10 * 86400,
        expiresAt: Math.floor(Date.now() / 1000) + 355 * 86400,
        status: WarrantyStatus.Active,
    },
];
