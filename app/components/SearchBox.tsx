"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBox({
  value,
  onChange,
  placeholder = "ค้นหา...",
}: SearchBoxProps) {
  return (
    <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
      <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />

      <input
        type="search"
        placeholder={placeholder}
        className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
