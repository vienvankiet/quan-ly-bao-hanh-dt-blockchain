import { useEffect, useRef, useState } from "react";
import {
    Bell,
    Search,
    Wallet,
    Menu,
    LogOut,
    Copy,
    Check,
    Shield,
    User,
} from "lucide-react";
import { useWeb3 } from "../../../../controllers/Web3Context";
import { roleLabel, roleColor, UserRole } from "../../../../models/roles";
import type { ModalType } from "../../Dashboard";
import "./DashboardHeader.css";

interface Props {
    onAction: (modal: ModalType, imei?: string) => void;
    onSearch: (imei: string) => void;
}

const DashboardHeader = ({ onAction, onSearch }: Props) => {
    const {
        account,
        isConnected,
        isMockMode,
        isAdmin,
        userRole,
        contractAddress,
        transactions,
        connectWallet,
        logout,
        toggleMockMode,
    } = useWeb3();
    const [query, setQuery] = useState("");
    const [walletOpen, setWalletOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const walletRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const walletLabel = isConnected && account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : isMockMode
          ? "Chế độ Demo"
          : "Kết nối Wallet";

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
                setWalletOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleSearch = () => {
        const q = query.trim();
        if (!q) {
            onAction("search");
            return;
        }
        onSearch(q);
    };

    const handleCopy = async () => {
        if (!account) return;
        await navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        setWalletOpen(false);
        logout();
    };

    const recentTx = transactions.slice(0, 5);

    return (
        <header className="dashboard-header">
            <div className="dashboard-header__inner">
                <div className="dashboard-header__left">
                    <div className="logo-container">
                        <div className="logo-icon">🔗</div>
                        <div>
                            <span className="badge">BLOCKCHAIN</span>
                            <h1>Warranty System</h1>
                        </div>
                    </div>

                    <div className="dashboard-info">
                        <h2>Dashboard</h2>
                        <p>Quản lý bảo hành điện thoại trên Blockchain</p>
                    </div>
                </div>

                <div className="dashboard-header__right">
                    <div className="search-container">
                        <button
                            type="button"
                            className="search-icon-btn"
                            onClick={handleSearch}
                            aria-label="Tìm kiếm IMEI"
                        >
                            <Search size={20} />
                        </button>
                        <input
                            type="text"
                            placeholder="Tìm kiếm IMEI, mã bảo hành..."
                            className="search-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>

                    <div className="header-dropdown" ref={notifRef}>
                        <button
                            className="header-icon notification-btn"
                            title="Thông báo giao dịch"
                            aria-label="Thông báo"
                            type="button"
                            onClick={() => {
                                setNotifOpen((v) => !v);
                                setWalletOpen(false);
                            }}
                        >
                            <Bell size={20} />
                            {recentTx.length > 0 && <span className="notification-dot" />}
                        </button>

                        {notifOpen && (
                            <div className="header-dropdown__panel">
                                <div className="header-dropdown__title">Giao dịch gần đây</div>
                                {recentTx.length === 0 ? (
                                    <p className="header-dropdown__empty">Chưa có giao dịch</p>
                                ) : (
                                    recentTx.map((tx) => (
                                        <div key={`${tx.hash}-${tx.timestamp}`} className="header-dropdown__item">
                                            <span className="header-dropdown__item-title">{tx.action}</span>
                                            <span className="header-dropdown__item-meta">
                                                {tx.status} · {new Date(tx.timestamp * 1000).toLocaleString("vi-VN")}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="header-dropdown" ref={walletRef}>
                        <button
                            className={`wallet-button ${isConnected ? "wallet-button--connected" : ""}`}
                            aria-label={isConnected ? "Menu ví" : "Kết nối Wallet"}
                            onClick={() => {
                                if (!isConnected) {
                                    if (isMockMode) {
                                        setWalletOpen((v) => !v);
                                        setNotifOpen(false);
                                        return;
                                    }
                                    void connectWallet();
                                    return;
                                }
                                setWalletOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            type="button"
                        >
                            <Wallet size={18} />
                            <span className="wallet-button__text">{walletLabel}</span>
                        </button>

                        {walletOpen && (isConnected || isMockMode) && (
                            <div className="header-dropdown__panel header-dropdown__panel--wallet">
                                {account ? (
                                    <div className="wallet-panel__addr">{account}</div>
                                ) : (
                                    <div className="wallet-panel__addr wallet-panel__addr--demo">
                                        Đang dùng chế độ Demo (không cần ví)
                                    </div>
                                )}
                                <div className="wallet-panel__badges">
                                    <span className={`wallet-badge ${isMockMode ? "wallet-badge--demo" : "wallet-badge--web3"}`}>
                                        {isMockMode ? "DEMO" : "WEB3"}
                                    </span>
                                    <span
                                        className={`wallet-badge ${isAdmin ? "wallet-badge--admin" : "wallet-badge--user"}`}
                                        style={!isAdmin ? { color: roleColor[userRole], background: `${roleColor[userRole]}22` } : undefined}
                                    >
                                        {isAdmin ? (
                                            <><Shield size={12} /> {roleLabel[UserRole.Admin]}</>
                                        ) : (
                                            <><User size={12} /> {roleLabel[userRole]}</>
                                        )}
                                    </span>
                                </div>
                                {contractAddress && (
                                    <div className="wallet-panel__contract" title={contractAddress}>
                                        Contract: {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)}
                                    </div>
                                )}
                                <button type="button" className="wallet-panel__btn" onClick={() => void handleCopy()} disabled={!account}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? "Đã sao chép" : "Sao chép địa chỉ"}
                                </button>
                                {!isConnected && isMockMode && (
                                    <button type="button" className="wallet-panel__btn" onClick={() => void connectWallet()}>
                                        <Wallet size={16} />
                                        Đăng nhập MetaMask
                                    </button>
                                )}
                                <button type="button" className="wallet-panel__btn wallet-panel__btn--danger" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="header-menu">
                        <button
                            className="wallet-button wallet-button--menu"
                            aria-haspopup="menu"
                            aria-label="Menu chức năng"
                            type="button"
                        >
                            <Menu size={18} />
                            <span className="wallet-button__text wallet-button__text--hide">
                                MENU
                            </span>
                        </button>

                        <div className="header-menu__dropdown" role="menu">
                            <button className="header-menu__item" type="button" onClick={() => onAction("activate")}>
                                Activate Warranty
                            </button>
                            <button className="header-menu__item" type="button" onClick={() => onAction("search")}>
                                Search IMEI
                            </button>
                            <button className="header-menu__item" type="button" onClick={() => onAction("transfer")}>
                                Transfer Ownership
                            </button>
                            <button className="header-menu__item" type="button" onClick={() => onAction("repair")}>
                                Add Repair
                            </button>
                            <button className="header-menu__item" type="button" onClick={toggleMockMode}>
                                {isMockMode ? "Chuyển sang Web3" : "Chuyển sang Demo"}
                            </button>
                            {(isConnected || isMockMode) && (
                                <button className="header-menu__item header-menu__item--danger" type="button" onClick={handleLogout}>
                                    Đăng xuất
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
