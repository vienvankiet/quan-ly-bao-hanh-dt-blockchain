import { useState, useEffect, useCallback } from "react";
import {
    X,
    QrCode,
    Search,
    Repeat,
    Wrench,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { useWeb3 } from "../../controllers/Web3Context";
import { statusLabel, statusColor } from "../../models/warranty";
import type { Warranty, RepairRecord } from "../../models/warranty";
import "./ActionModals.css";

// ─── Shared Overlay ───────────────────────────────────────────────────────────
function ModalOverlay({
    title,
    icon,
    onClose,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-card__header">
                    <div className="modal-card__title">
                        {icon}
                        <span>{title}</span>
                    </div>
                    <button className="modal-card__close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
    type,
    msg,
}: {
    type: "success" | "error";
    msg: string;
}) {
    return (
        <div className={`modal-toast modal-toast--${type}`}>
            {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg}</span>
        </div>
    );
}

// ─── 1. Activate Warranty Modal ───────────────────────────────────────────────
export function ActivateModal({ onClose }: { onClose: () => void }) {
    const { activateWarranty, isMockMode, isConnected, account, canActivate, connectWallet } = useWeb3();
    const [imei, setImei] = useState("");
    const [model, setModel] = useState("");
    const [owner, setOwner] = useState("");
    const [duration, setDuration] = useState("365");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMockMode && !isConnected) {
            showToast("error", "Vui lòng đăng nhập MetaMask trước!");
            void connectWallet();
            return;
        }
        if (!canActivate()) {
            showToast("error", "Chỉ tài khoản Admin mới được kích hoạt bảo hành!");
            return;
        }
        if (imei.length < 10) {
            showToast("error", "IMEI phải có ít nhất 10 ký tự!");
            return;
        }
        setLoading(true);
        try {
            const ownerAddr = owner.trim() || account || "";
            if (!ownerAddr) {
                showToast("error", "Vui lòng nhập địa chỉ ví chủ sở hữu hoặc kết nối MetaMask!");
                return;
            }
            await activateWarranty(imei, model, ownerAddr, Number(duration));
            showToast("success", `Kích hoạt IMEI ${imei} thành công!`);
            setImei("");
            setModel("");
            setOwner("");
            setDuration("365");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Giao dịch thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay title="Kích hoạt bảo hành" icon={<QrCode size={20} />} onClose={onClose}>
            {toast && <Toast type={toast.type} msg={toast.msg} />}
            <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-field">
                    <label>IMEI *</label>
                    <input
                        type="text"
                        placeholder="vd: 356789123456789"
                        value={imei}
                        onChange={(e) => setImei(e.target.value.trim())}
                        required
                        maxLength={20}
                    />
                </div>
                <div className="modal-field">
                    <label>Model máy *</label>
                    <input
                        type="text"
                        placeholder="vd: Samsung Galaxy S24 Ultra"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                    />
                </div>
                <div className="modal-field">
                    <label>Địa chỉ ví chủ sở hữu</label>
                    <input
                        type="text"
                        placeholder="0x... (để trống nếu chưa có)"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value.trim())}
                    />
                </div>
                <div className="modal-field">
                    <label>Thời hạn (ngày) *</label>
                    <div className="modal-presets">
                        {[180, 365, 730].map((d) => (
                            <button
                                key={d}
                                type="button"
                                className={`modal-preset ${duration === String(d) ? "modal-preset--active" : ""}`}
                                onClick={() => setDuration(String(d))}
                            >
                                {d === 180 ? "6 tháng" : d === 365 ? "1 năm" : "2 năm"}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        min={1}
                        max={3650}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="modal-submit" disabled={loading}>
                    {loading ? (
                        <><Loader2 size={16} className="modal-spin" /> Đang xử lý...</>
                    ) : (
                        <><QrCode size={16} /> Kích hoạt bảo hành</>
                    )}
                </button>
            </form>
        </ModalOverlay>
    );
}

// ─── 2. Search IMEI Modal ─────────────────────────────────────────────────────
export function SearchModal({
    onClose,
    initialImei = "",
}: {
    onClose: () => void;
    initialImei?: string;
}) {
    const { checkWarranty, getRepairHistory } = useWeb3();
    const [imei, setImei] = useState(initialImei);
    const [result, setResult] = useState<Warranty | null | undefined>(undefined);
    const [repairs, setRepairs] = useState<RepairRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!imei.trim()) return;
        setLoading(true);
        setResult(undefined);
        setRepairs([]);
        try {
            const w = await checkWarranty(imei.trim());
            setResult(w);
            if (w) {
                const hist = await getRepairHistory(imei.trim());
                setRepairs(hist);
            }
        } catch {
            setResult(null);
        } finally {
            setLoading(false);
        }
    }, [imei, checkWarranty, getRepairHistory]);

    useEffect(() => {
        if (initialImei.trim()) handleSearch();
    }, [initialImei, handleSearch]);

    const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("vi-VN");

    return (
        <ModalOverlay title="Tra cứu IMEI" icon={<Search size={20} />} onClose={onClose}>
            <div className="modal-form">
                <div className="modal-field">
                    <label>Nhập IMEI</label>
                    <div className="modal-search-row">
                        <input
                            type="text"
                            placeholder="356789123456789"
                            value={imei}
                            onChange={(e) => setImei(e.target.value.trim())}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button
                            type="button"
                            className="modal-submit"
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ marginTop: 0, flex: "0 0 auto" }}
                        >
                            {loading ? <Loader2 size={16} className="modal-spin" /> : <Search size={16} />}
                            Tra cứu
                        </button>
                    </div>
                </div>

                {result === null && (
                    <div className="modal-empty">Không tìm thấy thiết bị với IMEI này.</div>
                )}

                {result && (
                    <div className="modal-result">
                        <div className="modal-result__row">
                            <span>Model</span><span>{result.model}</span>
                        </div>
                        <div className="modal-result__row">
                            <span>IMEI</span><span className="modal-mono">{result.imei}</span>
                        </div>
                        <div className="modal-result__row">
                            <span>Chủ sở hữu</span>
                            <span className="modal-mono">{result.owner.slice(0, 10)}...{result.owner.slice(-4)}</span>
                        </div>
                        <div className="modal-result__row">
                            <span>Kích hoạt</span><span>{fmtDate(result.activatedAt)}</span>
                        </div>
                        <div className="modal-result__row">
                            <span>Hết hạn</span><span>{fmtDate(result.expiresAt)}</span>
                        </div>
                        <div className="modal-result__row">
                            <span>Trạng thái</span>
                            <span style={{ color: statusColor[result.status], fontWeight: 700 }}>
                                {statusLabel[result.status]}
                            </span>
                        </div>

                        {repairs.length > 0 && (
                            <div className="modal-repairs">
                                <h4>Lịch sử sửa chữa ({repairs.length})</h4>
                                {repairs.map((r, i) => (
                                    <div key={i} className="modal-repair-item">
                                        <span className="modal-repair-date">{fmtDate(r.timestamp)}</span>
                                        <span>{r.description}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ModalOverlay>
    );
}

// ─── 3. Transfer Ownership Modal ──────────────────────────────────────────────
export function TransferModal({
    onClose,
    initialImei = "",
}: {
    onClose: () => void;
    initialImei?: string;
}) {
    const { transferOwnership, isMockMode, isConnected, connectWallet } = useWeb3();
    const [imei, setImei] = useState(initialImei);
    const [newOwner, setNewOwner] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMockMode && !isConnected) {
            showToast("error", "Vui lòng đăng nhập MetaMask trước!");
            void connectWallet();
            return;
        }
        if (!imei.trim() || !newOwner.trim()) return;
        setLoading(true);
        try {
            await transferOwnership(imei.trim(), newOwner.trim());
            showToast("success", "Chuyển quyền sở hữu thành công!");
            setImei("");
            setNewOwner("");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalOverlay title="Chuyển quyền sở hữu" icon={<Repeat size={20} />} onClose={onClose}>
            {toast && <Toast type={toast.type} msg={toast.msg} />}
            <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-field">
                    <label>IMEI thiết bị *</label>
                    <input
                        type="text"
                        placeholder="356789123456789"
                        value={imei}
                        onChange={(e) => setImei(e.target.value.trim())}
                        required
                    />
                </div>
                <div className="modal-field">
                    <label>Địa chỉ ví chủ mới *</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={newOwner}
                        onChange={(e) => setNewOwner(e.target.value.trim())}
                        required
                    />
                </div>
                <button type="submit" className="modal-submit" disabled={loading}>
                    {loading ? (
                        <><Loader2 size={16} className="modal-spin" /> Đang xử lý...</>
                    ) : (
                        <><Repeat size={16} /> Xác nhận chuyển</>
                    )}
                </button>
            </form>
        </ModalOverlay>
    );
}

// ─── 4. Add Repair Modal ──────────────────────────────────────────────────────
export function RepairModal({
    onClose,
    initialImei = "",
}: {
    onClose: () => void;
    initialImei?: string;
}) {
    const {
        addRepairRecord,
        markRepairComplete,
        isMockMode,
        isConnected,
        canManageRepair,
        connectWallet,
    } = useWeb3();
    const [imei, setImei] = useState(initialImei);
    const [completeImei, setCompleteImei] = useState(initialImei);
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMockMode && !isConnected) {
            showToast("error", "Vui lòng đăng nhập MetaMask trước!");
            void connectWallet();
            return;
        }
        if (!canManageRepair()) {
            showToast("error", "Chỉ tài khoản Admin mới được thêm sửa chữa!");
            return;
        }
        if (!imei.trim() || !desc.trim()) return;
        setLoading(true);
        try {
            await addRepairRecord(imei.trim(), desc.trim());
            showToast("success", "Đã thêm lịch sử sửa chữa!");
            setImei("");
            setDesc("");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManageRepair()) {
            showToast("error", "Chỉ tài khoản Admin mới được đánh dấu hoàn tất!");
            return;
        }
        if (!completeImei.trim()) return;
        setCompleteLoading(true);
        try {
            await markRepairComplete(completeImei.trim());
            showToast("success", "Đã hoàn tất sửa chữa!");
            setCompleteImei("");
        } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Thất bại");
        } finally {
            setCompleteLoading(false);
        }
    };

    return (
        <ModalOverlay title="Thêm lịch sử sửa chữa" icon={<Wrench size={20} />} onClose={onClose}>
            {toast && <Toast type={toast.type} msg={toast.msg} />}
            <form className="modal-form" onSubmit={handleSubmit}>
                <div className="modal-field">
                    <label>IMEI thiết bị *</label>
                    <input
                        type="text"
                        placeholder="356789123456789"
                        value={imei}
                        onChange={(e) => setImei(e.target.value.trim())}
                        required
                    />
                </div>
                <div className="modal-field">
                    <label>Mô tả sửa chữa *</label>
                    <textarea
                        placeholder="Mô tả lỗi / hạng mục sửa chữa..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={3}
                        required
                    />
                </div>
                <button type="submit" className="modal-submit" disabled={loading}>
                    {loading ? (
                        <><Loader2 size={16} className="modal-spin" /> Đang xử lý...</>
                    ) : (
                        <><Wrench size={16} /> Thêm lịch sử</>
                    )}
                </button>
            </form>

            {canManageRepair() && (
                <form className="modal-form modal-form--divider" onSubmit={handleComplete}>
                    <h4 className="modal-subtitle">Hoàn tất sửa chữa</h4>
                    <div className="modal-field">
                        <label>IMEI thiết bị *</label>
                        <input
                            type="text"
                            placeholder="356789123456789"
                            value={completeImei}
                            onChange={(e) => setCompleteImei(e.target.value.trim())}
                            required
                        />
                    </div>
                    <button type="submit" className="modal-submit modal-submit--outline" disabled={completeLoading}>
                        {completeLoading ? (
                            <><Loader2 size={16} className="modal-spin" /> Đang xử lý...</>
                        ) : (
                            <><CheckCircle2 size={16} /> Đánh dấu hoàn tất</>
                        )}
                    </button>
                </form>
            )}
        </ModalOverlay>
    );
}
