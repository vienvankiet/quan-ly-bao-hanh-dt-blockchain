import { Loader2, Shield, Wallet } from "lucide-react";
import { useWeb3 } from "../../controllers/Web3Context";
import "./LoginPage.css";

const LoginPage = () => {
    const { connectWallet, enterDemoMode, isConnecting, connectError } = useWeb3();

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-card__logo">🔗</div>
                <span className="login-card__badge">BLOCKCHAIN WARRANTY</span>
                <h1>Hệ thống Quản lý Bảo hành</h1>
                <p>
                    Đăng nhập bằng ví MetaMask để thao tác trên blockchain Cronos Testnet,
                    hoặc dùng chế độ Demo để trải nghiệm giao diện.
                </p>

                {connectError && (
                    <div className="login-card__error" role="alert">
                        {connectError}
                    </div>
                )}

                <button
                    type="button"
                    className="login-card__btn login-card__btn--primary"
                    onClick={() => void connectWallet()}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <>
                            <Loader2 size={18} className="login-spin" />
                            Đang kết nối MetaMask...
                        </>
                    ) : (
                        <>
                            <Wallet size={18} />
                            Đăng nhập bằng MetaMask
                        </>
                    )}
                </button>

                <button
                    type="button"
                    className="login-card__btn login-card__btn--secondary"
                    onClick={enterDemoMode}
                    disabled={isConnecting}
                >
                    <Shield size={18} />
                    Tiếp tục chế độ Demo
                </button>

                <ul className="login-card__features">
                    <li>Kích hoạt & tra cứu bảo hành IMEI</li>
                    <li>Chuyển quyền sở hữu thiết bị</li>
                    <li>Lưu lịch sử sửa chữa trên blockchain</li>
                </ul>
            </div>
        </div>
    );
};

export default LoginPage;
