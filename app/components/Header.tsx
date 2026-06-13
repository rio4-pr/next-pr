"use client";

import { useState } from "react";
import {
  BellIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Header({
  toggle,
  title = "Dashboard",
}: {
  toggle: () => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-between items-center bg-white p-4 shadow">

      {/* 🔹 Left (Burger + Title) */}
      <div className="flex items-center gap-4">

        {/* ☰ Burger */}
        <button onClick={toggle}>
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>

        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {/* 🔹 Right Menu */}
      <div className="flex items-center gap-4 relative">

        {/* 🔔 Notification */}
        <BellIcon className="w-6 h-6 text-gray-600 cursor-pointer" />

        {/* 👤 User Box */}
        <div
          className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200"
          onClick={() => setOpen(!open)}
        >
          {/* รูปโปรไฟล์ */}
          <Image
            src="/user.png"
            alt="user"
            width={40}
            height={40}
            className="rounded-full"
          />

          {/* ชื่อ + สังกัด */}
          <div className="text-left leading-tight">
            <p className="text-sm font-semibold">ผู้ใช้งาน</p>
            <p className="text-xs text-gray-500">สำนัก/กอง</p>
          </div>

          {/* ลูกศร */}
          <ChevronDownIcon className="w-4 h-4 text-gray-600" />
        </div>

        {/* 🔻 Dropdown */}
        {open && (
          <div className="absolute right-0 top-14 w-48 bg-white border rounded-lg shadow-md z-50">
            <ul className="text-sm">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                โปรไฟล์
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                ตั้งค่า
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500">
                ออกจากระบบ
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
