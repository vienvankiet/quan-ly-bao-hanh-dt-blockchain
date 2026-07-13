import { useMemo } from "react";
import { Search, Repeat, Wrench, CheckCircle2 } from "lucide-react";

import { useWeb3 } from "../../../../controllers/Web3Context";
import { statusLabel, WarrantyStatus } from "../../../../models/warranty";
import type { ModalType } from "../../Dashboard";

import "./RecentWarrantyTable.css";

function shortAddr(addr: string) {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface Props {
    onAction: (modal: ModalType, imei?: string) => void;
    onSearch: (imei: string) => void;
}

const RecentWarrantyTable = ({ onAction, onSearch }: Props) => {
    const { warranties, canManageRepair, markRepairComplete, account, isAdmin, isMockMode } =
        useWeb3();

    const canTransferRow = (owner: string) => {
        if (isMockMode) return true;
        if (!account) return false;
        if (isAdmin) return true;
        return owner.toLowerCase() === account.toLowerCase();
    };

    const rows = useMemo(
        () =>
            [...warranties]
                .sort((a, b) => b.activatedAt - a.activatedAt)
                .map((w) => ({
                    imei: w.imei,
                    model: w.model,
                    owner: shortAddr(w.owner),
                    ownerRaw: w.owner,
                    expire: new Date(w.expiresAt * 1000).toLocaleDateString("vi-VN"),
                    status: statusLabel[w.status],
                    statusKey: statusLabel[w.status].toLowerCase(),
                    rawStatus: w.status,
                })),
        [warranties]
    );

    const handleComplete = async (imei: string) => {
        if (!window.confirm(`Đánh dấu hoàn tất sửa chữa cho IMEI ${imei}?`)) return;
        try {
            await markRepairComplete(imei);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Thất bại");
        }
    };

    return (
        <section className="recent-table">
            <div className="recent-table__header">
                <h3>Recent Warranty</h3>
                <button type="button" onClick={() => onAction("search")}>
                    {rows.length} thiết bị
                </button>
            </div>

            {rows.length === 0 ? (
                <p style={{ color: "#8b8b8b", padding: "8px 0" }}>
                    Chưa có bảo hành nào. Hãy kích hoạt thiết bị đầu tiên.
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>IMEI</th>
                            <th>Model</th>
                            <th>Owner</th>
                            <th>Expire</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((item) => (
                            <tr key={item.imei}>
                                <td>{item.imei}</td>
                                <td>{item.model}</td>
                                <td>{item.owner}</td>
                                <td>{item.expire}</td>
                                <td>
                                    <span className={`status status--${item.statusKey}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            type="button"
                                            className="table-action"
                                            title="Tra cứu"
                                            onClick={() => onSearch(item.imei)}
                                        >
                                            <Search size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="table-action"
                                            title="Chuyển quyền"
                                            disabled={!canTransferRow(item.ownerRaw)}
                                            onClick={() => onAction("transfer", item.imei)}
                                        >
                                            <Repeat size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="table-action"
                                            title="Thêm sửa chữa"
                                            onClick={() => onAction("repair", item.imei)}
                                        >
                                            <Wrench size={16} />
                                        </button>
                                        {canManageRepair() &&
                                            item.rawStatus === WarrantyStatus.Repair && (
                                                <button
                                                    type="button"
                                                    className="table-action table-action--success"
                                                    title="Hoàn tất sửa chữa"
                                                    onClick={() => void handleComplete(item.imei)}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};

export default RecentWarrantyTable;
