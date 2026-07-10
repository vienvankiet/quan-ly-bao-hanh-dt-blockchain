import { Bell, Search, Wallet, Menu } from "lucide-react";
import "./DashboardHeader.css";

const DashboardHeader = () => {
    return (
        <header className="dashboard-header">
            <div className="dashboard-header__inner">
                {/* Left */}
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

                {/* Right */}
                <div className="dashboard-header__right">
                    <div className="search-container">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm IMEI, mã bảo hành..."
                            className="search-input"
                        />
                    </div>

                    <button
                        className="header-icon notification-btn"
                        title="Thông báo"
                        aria-label="Thông báo"
                    >
                        <Bell size={20} />
                        <span className="notification-dot" />
                    </button>

                    <button
                        className="wallet-button"
                        aria-label="Kết nối Wallet"
                    >
                        <Wallet size={18} />
                        <span className="wallet-button__text">
                            Kết nối Wallet
                        </span>
                    </button>

                    <div className="header-menu">
                        <button
                            className="wallet-button wallet-button--menu"
                            aria-haspopup="menu"
                            aria-label="Menu BLOCKCHAIN"
                            type="button"
                        >
                            <Menu size={18} />
                            <span className="wallet-button__text wallet-button__text--hide">
                                BLOCKCHAIN
                            </span>
                        </button>

                        <div className="header-menu__dropdown" role="menu">
                            <button className="header-menu__item" type="button">
                                Activate Warranty
                            </button>
                            <button className="header-menu__item" type="button">
                                Search IMEI
                            </button>
                            <button className="header-menu__item" type="button">
                                Transfer Ownership
                            </button>
                            <button className="header-menu__item" type="button">
                                Add Repair
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;

