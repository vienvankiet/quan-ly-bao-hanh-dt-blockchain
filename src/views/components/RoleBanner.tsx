import { useWeb3 } from "../../controllers/Web3Context";
import { roleLabel, roleColor, hasPermission, PERMISSIONS } from "../../models/roles";
import "./RoleBanner.css";

const actionLabels: Record<keyof typeof PERMISSIONS, string> = {
    search: "Tra cứu",
    activate: "Kích hoạt",
    transfer: "Chuyển quyền",
    addRepair: "Thêm sửa chữa",
    completeRepair: "Hoàn tất sửa",
};

const RoleBanner = () => {
    const { userRole, isMockMode, contractAddress, isConnected } = useWeb3();

    const allowed = (Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]).filter(
        (a) => isMockMode || hasPermission(userRole, a)
    );

    return (
        <section className="role-banner">
            <div className="role-banner__left">
                <span
                    className="role-banner__badge"
                    style={{ color: roleColor[userRole], borderColor: `${roleColor[userRole]}55` }}
                >
                    {roleLabel[userRole]}
                </span>
                <span className="role-banner__mode">
                    {isMockMode ? "Demo Mode" : "Web3 · Cronos Testnet"}
                </span>
            </div>
            <div className="role-banner__perms">
                {allowed.map((a) => (
                    <span key={a} className="role-banner__perm">{actionLabels[a]}</span>
                ))}
            </div>
            {!isMockMode && isConnected && !contractAddress && (
                <p className="role-banner__warn">
                    Chưa có contract. Chạy <code>npm run deploy:cronos</code> sau khi cấu hình PRIVATE_KEY.
                </p>
            )}
        </section>
    );
};

export default RoleBanner;
