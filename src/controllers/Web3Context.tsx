import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { BrowserProvider, Contract } from "ethers";

import {
    type BlockchainTx,
    type RepairRecord,
    type Warranty,
    WarrantyStatus,
} from "../models/warranty";
import CONTRACT_ABI from "../models/contractABI.json";
import { CHAIN_CONFIG, CONTRACT_ADDRESS, MOCK_SEED_DATA } from "../config/config";
import { UserRole, hasPermission, PERMISSIONS } from "../models/roles";

interface Web3ContextValue {
    account: string | null;
    isConnected: boolean;
    isMockMode: boolean;
    isAdmin: boolean;
    userRole: UserRole;
    ownedImeis: string[];
    isConnecting: boolean;
    sessionReady: boolean;
    connectError: string | null;
    contractAddress: string;
    warranties: Warranty[];
    transactions: BlockchainTx[];
    stats: { total: number; active: number; repair: number; expired: number };
    connectWallet: () => Promise<boolean>;
    disconnectWallet: () => void;
    logout: () => void;
    enterDemoMode: () => void;
    enterWeb3Mode: () => void;
    toggleMockMode: () => void;
    activateWarranty: (
        imei: string,
        model: string,
        owner: string,
        durationDays: number
    ) => Promise<void>;
    checkWarranty: (imei: string) => Promise<Warranty | null>;
    transferOwnership: (imei: string, newOwner: string) => Promise<void>;
    addRepairRecord: (imei: string, description: string) => Promise<void>;
    markRepairComplete: (imei: string) => Promise<void>;
    getRepairHistory: (imei: string) => Promise<RepairRecord[]>;
    canActivate: () => boolean;
    canManageRepair: () => boolean;
    canTransfer: (imei: string) => Promise<boolean>;
    hasAction: (action: keyof typeof PERMISSIONS) => boolean;
}

const STORAGE_KEY = "wm_mock_warranties";
const TX_KEY = "wm_mock_txs";
const MODE_KEY = "wm_mock_mode";
const LOGOUT_KEY = "wm_manual_logout";

function loadMockWarranties(): Warranty[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as Warranty[];
    } catch {}
    const seed = MOCK_SEED_DATA.map((d) => ({ ...d, status: d.status as WarrantyStatus }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
}

function saveMockWarranties(ws: Warranty[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
}

function loadMockTxs(): BlockchainTx[] {
    try {
        const raw = localStorage.getItem(TX_KEY);
        if (raw) return JSON.parse(raw) as BlockchainTx[];
    } catch {}
    return [];
}

function saveMockTxs(txs: BlockchainTx[]) {
    localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

function fakeTxHash() {
    return "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function computeStats(ws: Warranty[]) {
    return {
        total: ws.length,
        active: ws.filter((w) => w.status === WarrantyStatus.Active).length,
        repair: ws.filter((w) => w.status === WarrantyStatus.Repair).length,
        expired: ws.filter(
            (w) =>
                w.status === WarrantyStatus.Expired ||
                (w.status === WarrantyStatus.Active && w.expiresAt < Date.now() / 1000)
        ).length,
    };
}

const Web3Ctx = createContext<Web3ContextValue | null>(null);

export function useWeb3() {
    const ctx = useContext(Web3Ctx);
    if (!ctx) throw new Error("useWeb3 must be used inside Web3Provider");
    return ctx;
}

export function Web3Provider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [isMockMode, setIsMockMode] = useState<boolean>(
        () => localStorage.getItem(MODE_KEY) === "true"
    );
    const [warranties, setWarranties] = useState<Warranty[]>(() => loadMockWarranties());
    const [transactions, setTransactions] = useState<BlockchainTx[]>(() => loadMockTxs());
    const [isAdmin, setIsAdmin] = useState(false);
    const [ownedImeis, setOwnedImeis] = useState<string[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);
    const contractRef = useRef<Contract | null>(null);

    const isConnected = !!account;
    const stats = computeStats(warranties);

    const userRole: UserRole = (() => {
        if (isMockMode) return UserRole.Admin;
        if (!isConnected) return UserRole.Guest;
        if (isAdmin) return UserRole.Admin;
        if (ownedImeis.length > 0) return UserRole.Owner;
        return UserRole.User;
    })();

    const refreshOwnership = useCallback(
        async (addr: string, ws: Warranty[]) => {
            const owned = ws
                .filter((w) => w.owner.toLowerCase() === addr.toLowerCase())
                .map((w) => w.imei);
            setOwnedImeis(owned);
        },
        []
    );

    const bindContract = useCallback(async (addr: string) => {
        if (!CONTRACT_ADDRESS || typeof window.ethereum === "undefined") {
            contractRef.current = null;
            setIsAdmin(false);
            return;
        }
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const c = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        contractRef.current = c;
        try {
            const adminFlag: boolean = await c.isAdminAccount(addr);
            setIsAdmin(adminFlag);
        } catch {
            try {
                const adminAddr: string = await c.admin();
                setIsAdmin(adminAddr.toLowerCase() === addr.toLowerCase());
            } catch {
                setIsAdmin(false);
            }
        }
    }, []);

    const switchToCronosTestnet = useCallback(async () => {
        if (typeof window.ethereum === "undefined") return;
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: CHAIN_CONFIG.chainId }],
            });
        } catch (err: unknown) {
            const code = (err as { code?: number })?.code;
            if (code === 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [CHAIN_CONFIG],
                });
            }
        }
    }, []);

    const syncFromChain = useCallback(async () => {
        if (isMockMode || !contractRef.current) return;
        try {
            const c = contractRef.current;
            const total: bigint = await c.getTotalWarranties();
            const fetched: Warranty[] = [];
            for (let i = 0n; i < total; i++) {
                const imei: string = await c.getImeiByIndex(i);
                const [model, owner_, activatedAt, expiresAt, status] =
                    await c.checkWarranty(imei);
                fetched.push({
                    imei,
                    model,
                    owner: owner_,
                    activatedAt: Number(activatedAt),
                    expiresAt: Number(expiresAt),
                    status: Number(status) as WarrantyStatus,
                });
            }
            setWarranties(fetched);
            if (account) await refreshOwnership(account, fetched);
        } catch (e) {
            console.error("syncFromChain error:", e);
        }
    }, [account, isMockMode, refreshOwnership]);

    const connectWallet = useCallback(async (): Promise<boolean> => {
        if (typeof window.ethereum === "undefined") {
            setConnectError("MetaMask chưa được cài đặt! Vui lòng cài MetaMask.");
            return false;
        }
        setIsConnecting(true);
        setConnectError(null);
        try {
            localStorage.setItem(MODE_KEY, "false");
            localStorage.removeItem(LOGOUT_KEY);
            setIsMockMode(false);

            await switchToCronosTestnet();
            const provider = new BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const addr = accounts[0] as string;
            setAccount(addr);
            await bindContract(addr);
            await syncFromChain();
            return true;
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Không thể kết nối MetaMask";
            setConnectError(msg);
            return false;
        } finally {
            setIsConnecting(false);
        }
    }, [bindContract, switchToCronosTestnet, syncFromChain]);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setIsAdmin(false);
        setOwnedImeis([]);
        contractRef.current = null;
    }, []);

    const logout = useCallback(() => {
        localStorage.setItem(LOGOUT_KEY, "true");
        localStorage.setItem(MODE_KEY, "false");
        setIsMockMode(false);
        disconnectWallet();
        setConnectError(null);
    }, [disconnectWallet]);

    const enterDemoMode = useCallback(() => {
        localStorage.setItem(MODE_KEY, "true");
        localStorage.removeItem(LOGOUT_KEY);
        setIsMockMode(true);
        disconnectWallet();
        setWarranties(loadMockWarranties());
        setTransactions(loadMockTxs());
        setConnectError(null);
    }, [disconnectWallet]);

    const enterWeb3Mode = useCallback(() => {
        localStorage.setItem(MODE_KEY, "false");
        setIsMockMode(false);
    }, []);

    const toggleMockMode = useCallback(() => {
        if (isMockMode) {
            enterWeb3Mode();
            if (isConnected) void syncFromChain();
        } else {
            enterDemoMode();
        }
    }, [enterDemoMode, enterWeb3Mode, isConnected, isMockMode, syncFromChain]);

    useEffect(() => {
        if (!isMockMode && isConnected && account) {
            void bindContract(account).then(() => syncFromChain());
        }
    }, [isMockMode, isConnected, account, bindContract, syncFromChain]);

    useEffect(() => {
        const initSession = async () => {
            if (isMockMode) {
                setWarranties(loadMockWarranties());
                setTransactions(loadMockTxs());
                setSessionReady(true);
                return;
            }
            if (localStorage.getItem(LOGOUT_KEY) === "true") {
                setSessionReady(true);
                return;
            }
            if (typeof window.ethereum === "undefined") {
                setSessionReady(true);
                return;
            }
            try {
                const provider = new BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);
                if (accounts.length > 0) {
                    const addr = accounts[0] as string;
                    setAccount(addr);
                    await bindContract(addr);
                    await syncFromChain();
                }
            } catch {
                /* ignore silent reconnect errors */
            } finally {
                setSessionReady(true);
            }
        };
        void initSession();
    }, [bindContract, isMockMode, syncFromChain]);

    useEffect(() => {
        if (typeof window.ethereum === "undefined") return;

        const onAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet();
                return;
            }
            const addr = accounts[0];
            setAccount(addr);
            void bindContract(addr).then(() => syncFromChain());
        };

        const onChainChanged = () => {
            if (account) void bindContract(account).then(() => syncFromChain());
        };

        window.ethereum.on("accountsChanged", onAccountsChanged);
        window.ethereum.on("chainChanged", onChainChanged);
        return () => {
            window.ethereum.removeListener("accountsChanged", onAccountsChanged);
            window.ethereum.removeListener("chainChanged", onChainChanged);
        };
    }, [account, bindContract, disconnectWallet, syncFromChain]);

    const pushTx = useCallback(
        (action: string, hash: string, status: BlockchainTx["status"] = "success") => {
            const tx: BlockchainTx = {
                hash,
                action,
                status,
                timestamp: Math.floor(Date.now() / 1000),
            };
            setTransactions((prev) => {
                const next = [tx, ...prev].slice(0, 20);
                saveMockTxs(next);
                return next;
            });
        },
        []
    );

    const canActivate = useCallback(
        () => isMockMode || hasPermission(userRole, "activate"),
        [isMockMode, userRole]
    );

    const canManageRepair = useCallback(
        () => isMockMode || hasPermission(userRole, "addRepair"),
        [isMockMode, userRole]
    );

    const canTransfer = useCallback(
        async (imei: string): Promise<boolean> => {
            if (isMockMode) return true;
            if (!isConnected || !account) return false;
            if (isAdmin) return true;
            const c = contractRef.current;
            if (c) {
                try {
                    return await c.canTransferOwnership(imei, account);
                } catch {
                    /* fallback */
                }
            }
            const w = warranties.find((x) => x.imei === imei);
            return w?.owner.toLowerCase() === account.toLowerCase();
        },
        [account, isAdmin, isConnected, isMockMode, warranties]
    );

    const hasAction = useCallback(
        (action: keyof typeof PERMISSIONS) =>
            isMockMode || hasPermission(userRole, action),
        [isMockMode, userRole]
    );

    const activateWarranty = useCallback(
        async (imei: string, model: string, owner: string, durationDays: number) => {
            if (!canActivate()) {
                throw new Error("Chỉ admin mới được kích hoạt bảo hành!");
            }
            if (isMockMode) {
                setWarranties((prev) => {
                    const idx = prev.findIndex((w) => w.imei === imei);
                    const now = Math.floor(Date.now() / 1000);
                    const expiry = now + durationDays * 86400;
                    const entry: Warranty = {
                        imei,
                        model,
                        owner,
                        activatedAt: now,
                        expiresAt: expiry,
                        status: WarrantyStatus.Active,
                    };
                    const next =
                        idx >= 0
                            ? prev.map((w, i) => (i === idx ? entry : w))
                            : [...prev, entry];
                    saveMockWarranties(next);
                    return next;
                });
                pushTx(`Activate Warranty (${imei})`, fakeTxHash());
                return;
            }
            const c = contractRef.current;
            if (!c) throw new Error("Contract chưa được tải. Kiểm tra VITE_CONTRACT_ADDRESS.");
            const tx = await c.activateWarranty(imei, model, owner, durationDays);
            pushTx(`Activate Warranty (${imei})`, tx.hash, "pending");
            await tx.wait();
            pushTx(`Activate Warranty (${imei})`, tx.hash, "success");
            await syncFromChain();
        },
        [canActivate, isMockMode, pushTx, syncFromChain]
    );

    const checkWarranty = useCallback(
        async (imei: string): Promise<Warranty | null> => {
            if (isMockMode) {
                return warranties.find((w) => w.imei === imei) ?? null;
            }
            const c = contractRef.current;
            if (!c) return null;
            try {
                const [model, owner_, activatedAt, expiresAt, status] =
                    await c.checkWarranty(imei);
                return {
                    imei,
                    model,
                    owner: owner_,
                    activatedAt: Number(activatedAt),
                    expiresAt: Number(expiresAt),
                    status: Number(status) as WarrantyStatus,
                };
            } catch {
                return null;
            }
        },
        [isMockMode, warranties]
    );

    const transferOwnership = useCallback(
        async (imei: string, newOwner: string) => {
            if (isMockMode) {
                setWarranties((prev) => {
                    const next = prev.map((w) =>
                        w.imei === imei ? { ...w, owner: newOwner } : w
                    );
                    saveMockWarranties(next);
                    return next;
                });
                pushTx(`Transfer Ownership (${imei})`, fakeTxHash());
                return;
            }
            if (!isConnected) throw new Error("Vui lòng đăng nhập MetaMask!");
            const allowed = await canTransfer(imei);
            if (!allowed) {
                throw new Error("Bạn không có quyền chuyển thiết bị này!");
            }
            const c = contractRef.current;
            if (!c) throw new Error("Contract chưa được tải.");
            const tx = await c.transferOwnership(imei, newOwner);
            pushTx(`Transfer Ownership (${imei})`, tx.hash, "pending");
            await tx.wait();
            pushTx(`Transfer Ownership (${imei})`, tx.hash, "success");
            await syncFromChain();
        },
        [canTransfer, isConnected, isMockMode, pushTx, syncFromChain]
    );

    const addRepairRecord = useCallback(
        async (imei: string, description: string) => {
            if (!canManageRepair()) {
                throw new Error("Chỉ admin mới được thêm lịch sử sửa chữa!");
            }
            if (isMockMode) {
                const key = `wm_repair_${imei}`;
                const existing: RepairRecord[] = JSON.parse(
                    localStorage.getItem(key) || "[]"
                );
                existing.push({
                    timestamp: Math.floor(Date.now() / 1000),
                    description,
                    recordedBy: account || "0xMockAdmin",
                });
                localStorage.setItem(key, JSON.stringify(existing));

                setWarranties((prev) => {
                    const next = prev.map((w) =>
                        w.imei === imei ? { ...w, status: WarrantyStatus.Repair } : w
                    );
                    saveMockWarranties(next);
                    return next;
                });
                pushTx(`Add Repair Record (${imei})`, fakeTxHash());
                return;
            }
            const c = contractRef.current;
            if (!c) throw new Error("Contract chưa được tải.");
            const tx = await c.addRepairRecord(imei, description);
            pushTx(`Add Repair Record (${imei})`, tx.hash, "pending");
            await tx.wait();
            pushTx(`Add Repair Record (${imei})`, tx.hash, "success");
            await syncFromChain();
        },
        [account, canManageRepair, isMockMode, pushTx, syncFromChain]
    );

    const markRepairComplete = useCallback(
        async (imei: string) => {
            if (!canManageRepair()) {
                throw new Error("Chỉ admin mới được đánh dấu hoàn tất sửa chữa!");
            }
            if (isMockMode) {
                setWarranties((prev) => {
                    const next = prev.map((w) => {
                        if (w.imei !== imei) return w;
                        const newStatus =
                            w.expiresAt < Date.now() / 1000
                                ? WarrantyStatus.Expired
                                : WarrantyStatus.Active;
                        return { ...w, status: newStatus };
                    });
                    saveMockWarranties(next);
                    return next;
                });
                pushTx(`Mark Repair Complete (${imei})`, fakeTxHash());
                return;
            }
            const c = contractRef.current;
            if (!c) throw new Error("Contract chưa được tải.");
            const tx = await c.markRepairComplete(imei);
            pushTx(`Mark Repair Complete (${imei})`, tx.hash, "pending");
            await tx.wait();
            pushTx(`Mark Repair Complete (${imei})`, tx.hash, "success");
            await syncFromChain();
        },
        [canManageRepair, isMockMode, pushTx, syncFromChain]
    );

    const getRepairHistory = useCallback(
        async (imei: string): Promise<RepairRecord[]> => {
            if (isMockMode) {
                const key = `wm_repair_${imei}`;
                return JSON.parse(localStorage.getItem(key) || "[]") as RepairRecord[];
            }
            const c = contractRef.current;
            if (!c) return [];
            try {
                const raw = await c.getRepairHistory(imei);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return raw.map((r: any) => ({
                    timestamp: Number(r.timestamp),
                    description: r.description,
                    recordedBy: r.recordedBy,
                }));
            } catch {
                return [];
            }
        },
        [isMockMode]
    );

    return (
        <Web3Ctx.Provider
            value={{
                account,
                isConnected,
                isMockMode,
                isAdmin,
                userRole,
                ownedImeis,
                isConnecting,
                sessionReady,
                connectError,
                contractAddress: CONTRACT_ADDRESS,
                warranties,
                transactions,
                stats,
                connectWallet,
                disconnectWallet,
                logout,
                enterDemoMode,
                enterWeb3Mode,
                toggleMockMode,
                activateWarranty,
                checkWarranty,
                transferOwnership,
                addRepairRecord,
                markRepairComplete,
                getRepairHistory,
                canActivate,
                canManageRepair,
                canTransfer,
                hasAction,
            }}
        >
            {children}
        </Web3Ctx.Provider>
    );
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ethereum?: any;
    }
}
