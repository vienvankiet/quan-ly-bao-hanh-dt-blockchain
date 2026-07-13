import {
    Smartphone,
    ShieldCheck,
    Wrench,
    Blocks,
} from "lucide-react";

import { useWeb3 } from "../../../../controllers/Web3Context";
import type { ModalType } from "../../Dashboard";
import StatCard from "./StatCard";

import "./StatsGrid.css";

function countThisMonth(activatedAtList: number[]) {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const threshold = Math.floor(start.getTime() / 1000);
    return activatedAtList.filter((ts) => ts >= threshold).length;
}

interface Props {
    onAction: (modal: ModalType) => void;
}

const StatsGrid = ({ onAction }: Props) => {
    const { stats, transactions, warranties } = useWeb3();

    const activatedThisMonth = countThisMonth(warranties.map((w) => w.activatedAt));
    const txThisMonth = countThisMonth(transactions.map((t) => t.timestamp));

    const fmt = (n: number) => n.toLocaleString("vi-VN");
    const change = (n: number) => (n > 0 ? `+${n}` : "0");

    const cards = [
        {
            title: "Activated Devices",
            value: fmt(stats.total),
            change: change(activatedThisMonth),
            icon: <Smartphone size={26} />,
            action: "activate" as ModalType,
        },
        {
            title: "Under Warranty",
            value: fmt(stats.active),
            change: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : "0%",
            icon: <ShieldCheck size={26} />,
            action: "search" as ModalType,
        },
        {
            title: "Repair Requests",
            value: fmt(stats.repair),
            change: change(stats.repair),
            icon: <Wrench size={26} />,
            action: "repair" as ModalType,
        },
        {
            title: "Blockchain Transactions",
            value: fmt(transactions.length),
            change: change(txThisMonth),
            icon: <Blocks size={26} />,
            action: "search" as ModalType,
        },
    ];

    return (
        <section className="stats-grid">
            {cards.map((card) => (
                <button
                    key={card.title}
                    type="button"
                    className="stats-grid__card-btn"
                    onClick={() => onAction(card.action)}
                    title={`Mở ${card.title}`}
                >
                    <StatCard
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        icon={card.icon}
                    />
                </button>
            ))}
        </section>
    );
};

export default StatsGrid;
