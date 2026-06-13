"use client";

import { memo } from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

interface ExpenseData {
    name: string;
    value: number;
}

interface Props {
    data: ExpenseData[];
}

const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
    "#F97316",
    "#6366F1",
];

function ExpensePieChart({
    data,
}: Props) {
    return (
        <div className="h-[320px]">
            <ResponsiveContainer
                width="100%"
                height="100%"
                debounce={300}
            >
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"

                        isAnimationActive={false}

                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                    >
                        {data.map(
                            (_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        COLORS[
                                        index %
                                        COLORS.length
                                        ]
                                    }
                                />
                            )
                        )}
                    </Pie>

                    <Tooltip
                        formatter={(value) => [
                            `฿${Number(value).toLocaleString()}`,
                            "จำนวนเงิน",
                        ]}
                    />

                    <Legend
                        verticalAlign="bottom"
                        height={36}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
export default memo(
    ExpensePieChart
);