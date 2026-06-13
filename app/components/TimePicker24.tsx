"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const normalize = (v: string) => {
  if (!v?.includes(":")) return ["00", "00"];
  const [h, m] = v.split(":");
  return [h.padStart(2, "0"), m.padStart(2, "0")];
};

export default function TimePicker24({ value, onChange }: Props) {
  const [hour, minute] = normalize(value);

  const updateTime = (h: string, m: string) => {
    onChange(`${h}:${m}`);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={hour}
        onChange={(e) => updateTime(e.target.value, minute)}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const h = String(i).padStart(2, "0");
          return <option key={h} value={h}>{h}</option>;
        })}
      </select>

      <span>:</span>

      <select
        value={minute}
        onChange={(e) => updateTime(hour, e.target.value)}
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const m = String(i).padStart(2, "0");
          return <option key={m} value={m}>{m}</option>;
        })}
      </select>
    </div>
  );
}
