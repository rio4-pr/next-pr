"use client";

import { useState } from "react";

type Props = {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
};


  export default function TimePicker24({ value, onChange }: Props) {
  const [hour, setHour] = useState(value?.split(":")[0] || "00");
  const [minute, setMinute] = useState(value?.split(":")[1] || "00");

  const updateTime = (h: string, m: string) => {
    onChange(`${h}:${m}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={hour}
        onChange={(e) => {
          const h = e.target.value;
          setHour(h);
          updateTime(h, minute);
        }}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const h = String(i).padStart(2, "0");
          return (
            <option key={h} value={h}>
              {h}
            </option>
          );
        })}
      </select>

      <span className="text-slate-500">:</span>

      <select
        value={minute}
        onChange={(e) => {
          const m = e.target.value;
          setMinute(m);
          updateTime(hour, m);
        }}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const m = String(i).padStart(2, "0");
          return (
            <option key={m} value={m}>
              {m}
            </option>
          );
        })}
      </select>
    </div>
  );
}
