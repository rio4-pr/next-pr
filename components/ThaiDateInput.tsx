"use client";

import { useId, useRef } from "react";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

type Props = {
  id?: string; // ✅ เพิ่ม
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  error?: string;
};

function formatThaiDate(dateStr: string) {
  if (!dateStr) return "";

  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];

  const [year, month, day] = dateStr.split("-");
  const thaiYear = parseInt(year, 10) + 543;

  return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${thaiYear}`;
}

export default function ThaiDateInput({
  id,
  label,
  value,
  onChange,
  required,
  min,
  max,
  error,
}: Props) {
  const generatedId = useId();
  const inputId = id || generatedId; // ✅ ใช้ id ที่ส่งมา หรือ generate

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className="relative cursor-pointer"
        onClick={() => {
          if (inputRef.current?.showPicker) {
            inputRef.current.showPicker();
          } else {
            inputRef.current?.focus();
            inputRef.current?.click();
          }
        }}
      >
        {/* แสดงผล */}
        <input
          type="text"
          readOnly
          value={value ? formatThaiDate(value) : ""}
          placeholder="เลือกวันที่"
          className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm
            ${error
              ? "border-red-400 bg-red-50"
              : "border-slate-200 bg-slate-50"}
          `}
        />

        {/* icon */}
        <CalendarDaysIcon
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        />

        {/* input จริง */}
        <input
          ref={inputRef}
          id={inputId} // ✅ ใช้ id จริง
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="hidden"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}