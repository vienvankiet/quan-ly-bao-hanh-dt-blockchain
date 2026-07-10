import type { ReactNode } from "react";

import "./StatCard.css";

interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: ReactNode;
}

const StatCard = ({ title, value, change, icon }: StatCardProps) => {
    return (
        <div className="stat-card">
            <div className="stat-card__top">
                <div className="stat-card__icon">
                    {icon}
                </div>

                <span className="stat-card__change">
                    {change}
                </span>
            </div>

            <h2 className="stat-card__value">
                {value}
            </h2>

            <p className="stat-card__title">
                {title}
            </p>
        </div>
    );
};

export default StatCard;