"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function TravelBarChart({
    data,
}: {
    data: any[];
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={320}
        >
            <BarChart data={data}>
                <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar
                    dataKey="travel"
                    name="ไปราชการ"

                    fill="#16a34a"

                    radius={[
                        8,
                        8,
                        0,
                        0,
                    ]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}