"use client";

import { memo } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function TravelBarChart({
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

                        isAnimationActive={false}

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
        </div>
    );
}
export default memo(
    TravelBarChart
);