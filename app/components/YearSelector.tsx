"use client";

import { CalendarDays } from "lucide-react";

interface Props {
    years: number[];
    value: number;
    onChange: (
        year: number
    ) => void;
}
export default function YearSelector({
    value,
    onChange,
}: Props) {
    const currentFY =
        new Date().getMonth() >= 9
            ? new Date().getFullYear() + 544
            : new Date().getFullYear() + 543;

    const years = Array.from(
        { length: 10 },
        (_, i) => currentFY - i
    );

    return (
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-slate-600 font-medium">
                <CalendarDays size={18} />
                <span>ปีงบประมาณ</span>
            </div>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) =>
                        onChange(
                            Number(e.target.value)
                        )
                    }
                    className="
            appearance-none
            cursor-pointer

            rounded-2xl
            border-0

            bg-gradient-to-r
            from-blue-500
            to-indigo-600

            text-white
            font-semibold

            px-5
            py-3
            pr-12

            shadow-lg
            shadow-blue-200

            transition-all
            duration-300

            hover:shadow-xl
            hover:scale-[1.02]

            focus:outline-none
            focus:ring-4
            focus:ring-blue-200
          "
                >
                    {years.map((year) => (
                        <option
                            key={year}
                            value={year}
                        >
                            ปีงบประมาณ {year}
                        </option>
                    ))}
                </select>

                <div
                    className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-white
          "
                >
                    ▼
                </div>
            </div>
        </div>
    );
}