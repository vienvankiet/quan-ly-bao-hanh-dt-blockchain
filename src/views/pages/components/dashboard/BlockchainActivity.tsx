import { Bell, Search } from "lucide-react";

import "./BlockchainActivity.css";

const transactions = [
    {
        hash: "0x9f3b...c7a1",
        type: "Warranty activated",
        status: "success" as const,
    },
    {
        hash: "0xa21c...19d8",
        type: "Ownership transfer",
        status: "pending" as const,
    },
    {
        hash: "0x44d0...7e2f",
        type: "Repair request created",
        status: "success" as const,
    },
];

const BlockchainActivity = () => {
    return (
        <section className="blockchain-activity">
            <div className="blockchain-activity__header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Bell size={18} />
                    <h3>Blockchain Activity</h3>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Search size={16} />
                    <span style={{ color: "#8b8b8b", fontSize: 12, fontWeight: 600 }}>
                        Latest events
                    </span>
                </div>
            </div>

            <div className="blockchain-activity__list">
                {transactions.map((tx) => (
                    <div key={tx.hash} className="transaction-card">
                        <div className="transaction-card__top">
                            <span className="transaction-hash">{tx.hash}</span>

                            <span
                                className={`status ${
                                    tx.status === "success"
                                        ? "status-success"
                                        : "status-pending"
                                }`}
                            >
                                {tx.status === "success" ? "Success" : "Pending"}
                            </span>
                        </div>

                        <div className="transaction-card__bottom">
                            <span>{tx.type}</span>
                            <span>{tx.status === "success" ? "Just now" : "2m ago"}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlockchainActivity;
