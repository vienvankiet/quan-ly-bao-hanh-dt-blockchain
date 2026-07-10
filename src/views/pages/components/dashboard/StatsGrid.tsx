import {
    Smartphone,
    ShieldCheck,
    Wrench,
    Blocks,
} from "lucide-react";

import StatCard from "./StatCard";

import "./StatsGrid.css";

const StatsGrid = () => {
    return (
        <section className="stats-grid">
            <StatCard
                title="Activated Devices"
                value="1,245"
                change="+12%"
                icon={<Smartphone size={26} />}
            />

            <StatCard
                title="Under Warranty"
                value="865"
                change="+8%"
                icon={<ShieldCheck size={26} />}
            />

            <StatCard
                title="Repair Requests"
                value="94"
                change="+5%"
                icon={<Wrench size={26} />}
            />

            <StatCard
                title="Blockchain Transactions"
                value="3,480"
                change="+15%"
                icon={<Blocks size={26} />}
            />
        </section>
    );
};

export default StatsGrid;