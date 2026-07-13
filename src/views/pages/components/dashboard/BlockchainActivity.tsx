import { ExternalLink } from "lucide-react";

import { useWeb3 } from "../../../../controllers/Web3Context";
import { CHAIN_CONFIG } from "../../../../config/config";

import "./BlockchainActivity.css";

function shortHash(hash: string) {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function timeAgo(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

const BlockchainActivity = () => {
    const { transactions } = useWeb3();
    const recent = transactions.slice(0, 5);
    const explorer = CHAIN_CONFIG.blockExplorerUrls[0];

    const openTx = (hash: string) => {
        if (hash.startsWith("0x") && hash.length > 10) {
            window.open(`${explorer}/tx/${hash}`, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <section className="blockchain-activity">
            <div className="blockchain-activity__header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <h3>Blockchain Activity</h3>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "#8b8b8b", fontSize: 12, fontWeight: 600 }}>
                        Latest events
                    </span>
                </div>
            </div>

            <div className="blockchain-activity__list">
                {recent.length === 0 ? (
                    <p style={{ color: "#8b8b8b", fontSize: ".9rem" }}>
                        Chưa có giao dịch. Thực hiện thao tác bảo hành để xem hoạt động.
                    </p>
                ) : (
                    recent.map((tx) => (
                        <button
                            key={`${tx.hash}-${tx.timestamp}`}
                            type="button"
                            className="transaction-card transaction-card--clickable"
                            onClick={() => openTx(tx.hash)}
                            title="Xem trên explorer"
                        >
                            <div className="transaction-card__top">
                                <span className="transaction-hash">{shortHash(tx.hash)}</span>

                                <span
                                    className={`status ${
                                        tx.status === "success"
                                            ? "status-success"
                                            : tx.status === "pending"
                                              ? "status-pending"
                                              : "status-pending"
                                    }`}
                                >
                                    {tx.status === "success"
                                        ? "Success"
                                        : tx.status === "pending"
                                          ? "Pending"
                                          : "Failed"}
                                </span>
                            </div>

                            <div className="transaction-card__bottom">
                                <span>{tx.action}</span>
                                <span className="transaction-card__time">
                                    {timeAgo(tx.timestamp)}
                                    <ExternalLink size={12} />
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </section>
    );
};

export default BlockchainActivity;
