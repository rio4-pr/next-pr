"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function VehicleAreaChart({
    data,
}: {
    data: any[];
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={320}
        >
            <AreaChart data={data}>
                <defs>
                    <linearGradient
                        id="vehicleGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="5%"
                            stopColor="#ea580c"
                            stopOpacity={0.8}
                        />

                        <stop
                            offset="95%"
                            stopColor="#ea580c"
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>

                <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Area
                    type="monotone"
                    dataKey="vehicle"
                    name="ขอใช้รถ"

                    stroke="#ea580c"

                    strokeWidth={3}

                    fill="url(#vehicleGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}