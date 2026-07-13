import {
    QrCode,
    Search,
    Repeat,
    Wrench,
} from "lucide-react";

import { useWeb3 } from "../../../../controllers/Web3Context";
import type { ModalType } from "../../Dashboard";

import "./QuickActions.css";

interface Props {
    onAction: (modal: ModalType, imei?: string) => void;
}

const actions: {
    title: string;
    description: string;
    icon: React.ReactNode;
    modal: ModalType;
    requiresAuth?: boolean;
}[] = [
    {
        title: "Activate Warranty",
        description: "Kích hoạt bảo hành điện tử",
        icon: <QrCode size={28} />,
        modal: "activate",
        requiresAuth: true,
    },
    {
        title: "Search IMEI",
        description: "Tra cứu thông tin bảo hành",
        icon: <Search size={28} />,
        modal: "search",
    },
    {
        title: "Transfer Ownership",
        description: "Chuyển quyền sở hữu",
        icon: <Repeat size={28} />,
        modal: "transfer",
        requiresAuth: true,
    },
    {
        title: "Add Repair",
        description: "Tạo lịch sử sửa chữa",
        icon: <Wrench size={28} />,
        modal: "repair",
        requiresAuth: true,
    },
];

const QuickActions = ({ onAction }: Props) => {
    const { isConnected, isMockMode, connectWallet } = useWeb3();

    const handleClick = (modal: ModalType, requiresAuth?: boolean) => {
        if (requiresAuth && !isMockMode && !isConnected) {
            void connectWallet();
            return;
        }
        onAction(modal);
    };

    return (
        <section className="quick-actions">
            <h3>Quick Actions</h3>

            <div className="quick-actions__grid">
                {actions.map((action) => (
                    <button
                        key={action.title}
                        className="quick-action-card"
                        onClick={() => handleClick(action.modal, action.requiresAuth)}
                        type="button"
                    >
                        <div className="quick-action-card__icon">
                            {action.icon}
                        </div>

                        <h4>{action.title}</h4>

                        <p>{action.description}</p>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;
