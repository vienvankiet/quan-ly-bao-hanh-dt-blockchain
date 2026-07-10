import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import "./WarrantyChart.css";

const data = [
    { month: "Jan", activated: 120 },
    { month: "Feb", activated: 180 },
    { month: "Mar", activated: 240 },
    { month: "Apr", activated: 300 },
    { month: "May", activated: 270 },
    { month: "Jun", activated: 360 },
    { month: "Jul", activated: 420 },
];

const WarrantyChart = () => {
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