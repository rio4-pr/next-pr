"use client";

import {
    LineChart,
    Line,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function NewsLineChart({
    data,
}: {
    data: any[];
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={320}
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
    );
}