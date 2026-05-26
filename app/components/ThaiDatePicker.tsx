"use client";

import { useState, useRef, useEffect, useId } from "react";

type Props = {
  id?: string;
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
};

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export default function ThaiDatePicker({
  id,
  label,
  value,
  onChange,
}: Props) {
  const internalId = useId();
  const inputId = id || internalId;

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  // ปิด popup เมื่อคลิกข้างนอก
  useEffect(() => {
  if (!value) {
    const today = new Date();
    const iso = today.toISOString().split("T")[0];
    onChange(iso);
  }
}, [onChange, value]);

  // format ไทย
  function formatThai(date: Date) {
    const d = date.getDate();
    const m = thaiMonths[date.getMonth()];
    const y = date.getFullYear() + 543;
    return `${d} ${m} ${y}`;
  }

  // สร้าง days ในเดือน
  const getDays = () => {
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleSelect = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* INPUT */}
      <div
        onClick={() => setOpen(!open)}
        className="mt-2 w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
      >
        {selectedDate ? formatThai(selectedDate) : "เลือกวันที่"}
      </div>

      {/* POPUP */}
      {open && (
        <div className="absolute z-50 mt-2 w-80 rounded-2xl border bg-white shadow-lg p-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() =>
                setCurrent(
                  new Date(current.getFullYear(), current.getMonth() - 1)
                )
              }
              className="px-2 py-1 rounded hover:bg-slate-100"
            >
              ◀
            </button>

            <div className="font-semibold">
              {thaiMonths[current.getMonth()]}{" "}
              {current.getFullYear() + 543}
            </div>

            <button
              onClick={() =>
                setCurrent(
                  new Date(current.getFullYear(), current.getMonth() + 1)
                )
              }
              className="px-2 py-1 rounded hover:bg-slate-100"
            >
              ▶
            </button>
          </div>

          {/* DAYS HEADER */}
          <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-1">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {getDays().map((date, i) => {
              if (!date) return <div key={i}></div>;

              const isSelected =
                selectedDate &&
                date.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(date)}
                  className={`rounded-lg py-1 hover:bg-blue-100 ${isSelected
                      ? "bg-blue-600 text-white"
                      : "text-slate-700"
                    }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* TODAY */}
          <button
            onClick={() => handleSelect(new Date())}
            className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-sm hover:bg-slate-200"
          >
            วันนี้
          </button>
        </div>
      )}
    </div>
  );
}