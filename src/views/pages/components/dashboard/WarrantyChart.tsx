import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useWeb3 } from "../../../../controllers/Web3Context";

import "./WarrantyChart.css";

function buildChartData(activatedAtList: number[]) {
    const months: { month: string; yearMonth: string; activated: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            month: d.toLocaleString("en", { month: "short" }),
            yearMonth: `${d.getFullYear()}-${d.getMonth()}`,
            activated: 0,
        });
    }

    for (const ts of activatedAtList) {
        const d = new Date(ts * 1000);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const entry = months.find((m) => m.yearMonth === key);
        if (entry) entry.activated++;
    }

    return months.map(({ month, activated }) => ({ month, activated }));
}

const WarrantyChart = () => {
    const { warranties } = useWeb3();
    const data = useMemo(
        () => buildChartData(warranties.map((w) => w.activatedAt)),
        [warranties]
    );

    return (
        <section className="warranty-chart">
            <div className="warranty-chart__header">
                <div>
                    <h3>Warranty Overview</h3>
                    <span>Last 7 Months</span>
                </div>
            </div>

            <div className="warranty-chart__body">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="colorWarranty"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#8B5CF6"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            stroke="#2a2a2a"
                            strokeDasharray="4 4"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#8b8b8b", fontSize: 12 }}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#8b8b8b", fontSize: 12 }}
                            allowDecimals={false}
                        />

                        <Tooltip
                            contentStyle={{
                                background: "#1b1b1b",
                                border: "1px solid #2f2f2f",
                                borderRadius: "12px",
                                color: "#fff",
                            }}
                            labelStyle={{
                                color: "#fff",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="activated"
                            stroke="#8B5CF6"
                            strokeWidth={2.5}
                            fill="url(#colorWarranty)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};

export default WarrantyChart;
