"use client";

import { memo } from "react";

import {
    LineChart,
    Line,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function NewsLineChart({
    data,
}: {
    data: any[];
}) {
    return (
        <div className="h-[320px]">
            <ResponsiveContainer
                width="100%"
                height="100%"
                debounce={300}
            >
                <LineChart data={data}>
                    <CartesianGrid
                        stroke="#e5e7eb"
                        strokeDasharray="4 4"
                    />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="news"
                        name="ข่าว"

                        stroke="#2563eb"

                        strokeWidth={4}

                        isAnimationActive={false}

                        dot={{
                            r: 5,
                            fill: "#2563eb",
                        }}

                        activeDot={{
                            r: 8,
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
export default memo(
    NewsLineChart
);
