// ─── Warranty Status (mirrors Solidity enum) ─────────────────────────────────
export const WarrantyStatus = {
    None: 0,
    Active: 1,
    Repair: 2,
    Expired: 3,
} as const;

export type WarrantyStatus = (typeof WarrantyStatus)[keyof typeof WarrantyStatus];

// ─── Core Types ───────────────────────────────────────────────────────────────
export interface Warranty {
    imei: string;
    model: string;
    owner: string;
    activatedAt: number;
    expiresAt: number;
    status: WarrantyStatus;
}

export interface RepairRecord {
    timestamp: number;
    description: string;
    recordedBy: string;
}

export interface BlockchainTx {
    hash: string;
    action: string;
    status: "success" | "pending" | "failed";
    timestamp: number;
}

export const statusLabel: Record<WarrantyStatus, string> = {
    [WarrantyStatus.None]: "None",
    [WarrantyStatus.Active]: "Active",
    [WarrantyStatus.Repair]: "Repair",
    [WarrantyStatus.Expired]: "Expired",
};

export const statusColor: Record<WarrantyStatus, string> = {
    [WarrantyStatus.None]: "#6b7280",
    [WarrantyStatus.Active]: "#22c55e",
    [WarrantyStatus.Repair]: "#f59e0b",
    [WarrantyStatus.Expired]: "#ef4444",
};
