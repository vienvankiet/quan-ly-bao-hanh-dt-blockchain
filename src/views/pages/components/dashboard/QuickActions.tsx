import {
    QrCode,
    Search,
    Repeat,
    Wrench,
} from "lucide-react";

import "./QuickActions.css";

const actions = [
    {
        title: "Activate Warranty",
        description: "Kích hoạt bảo hành điện tử",
        icon: <QrCode size={28} />,
    },
    {
        title: "Search IMEI",
        description: "Tra cứu thông tin bảo hành",
        icon: <Search size={28} />,
    },
    {
        title: "Transfer Ownership",
        description: "Chuyển quyền sở hữu",
        icon: <Repeat size={28} />,
    },
    {
        title: "Add Repair",
        description: "Tạo lịch sử sửa chữa",
        icon: <Wrench size={28} />,
    },
];

const QuickActions = () => {
    return (
        <section className="quick-actions">
            <h3>Quick Actions</h3>

            <div className="quick-actions__grid">
                {actions.map((action) => (
                    <button
                        key={action.title}
                        className="quick-action-card"
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