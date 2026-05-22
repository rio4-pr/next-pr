"use client";
import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import ThaiDatePicker from "@/app/components/ThaiDatePicker";
import { formatThaiFull, toDate } from "@/app/utils/dateThai";
import { isInRange } from "@/app/utils/dateThai";

import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";


const vehicleSummary = [
  { label: "คำขอทั้งหมด", value: 12, icon: <DocumentTextIcon className="w-6 h-6" /> },
  { label: "อยู่ระหว่างตรวจสอบ", value: 3, icon: <ClockIcon className="w-6 h-6" /> },
  { label: "อนุมัติแล้ว", value: 7, icon: <CalendarDaysIcon className="w-6 h-6" /> },
  { label: "ไม่อนุมัติ", value: 2, icon: <BriefcaseIcon className="w-6 h-6" /> },
];

const rows = [
  {
    id: 1,
    date: "2024-05-21",
    subject: "ขอใช้รถยนต์ชลประทาน",
    destination: "ชป.318",
    status: "อนุมัติแล้ว",
  },
  {
    id: 2,
    date: "2024-05-20",
    subject: "ขอใช้รถยนต์ตรวจพื้นที่",
    destination: "อ่างเก็บน้ำ",
    status: "รออนุมัติ",
  },
  {
    id: 3,
    date: "2024-05-19",
    subject: "ขอใช้รถยนต์ประชุมหน่วย",
    destination: "สำนักงานชลประทาน",
    status: "อยู่ระหว่างตรวจสอบ",
  },
  {
    id: 4,
    date: "2024-05-18",
    subject: "ขอใช้รถยนต์ซ่อมบำรุง",
    destination: "ชป.318",
    status: "ไม่อนุมัติ",
  },
];

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "อยู่ระหว่างตรวจสอบ": "bg-blue-50 text-blue-700",
  "รออนุมัติ": "bg-yellow-50 text-yellow-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

export default function VehiclePage() {
  const [collapsed, setCollapsed] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [filters, setFilters] = useState({
    keyword: "",
    startDate: today,
    endDate: today,
    status: "ทั้งหมด",
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // 🔥 filter logic ต้องอยู่ในนี้
  const filtered = rows.filter((row) =>
    isInRange(row.date, filters.startDate, filters.endDate)
  );

  const filteredRows = filtered.filter((row) => {
    const matchKeyword =
      row.subject.includes(filters.keyword) ||
      row.destination.includes(filters.keyword);

    const matchStatus =
      filters.status === "ทั้งหมด" || row.status === filters.status;

    return matchKeyword && matchStatus;
  });


  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="vehicle" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="ขออนุญาตใช้ยานพาหนะส่วนกลาง" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">แบบฟอร์มขออนุญาตใช้ยานพาหนะส่วนกลาง</h1>
                <p className="mt-2 text-sm text-slate-500">จัดการคำขออนุญาตใช้ยานพาหนะส่วนกลางและติดตามสถานะการอนุมัติ</p>
              </div>
              <Link href="/vehicle/create" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                <DocumentTextIcon className="w-5 h-5" />
                สร้างคำขอใหม่
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {vehicleSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ค้นหา</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหา..."
                      value={filters.keyword}
                      onChange={(e) => handleFilterChange("keyword", e.target.value)}
                      className="ml-2 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ช่วงวันที่</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <ThaiDatePicker
                      id="startDate"
                      label="วันที่เริ่ม"
                      value={filters.startDate}
                      onChange={(v) => handleFilterChange("startDate", v)}
                    />

                    <ThaiDatePicker
                      id="endDate"
                      label="วันที่สิ้นสุด"
                      value={filters.endDate}
                      onChange={(v) => handleFilterChange("endDate", v)}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">สถานะ</span>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <option>ทั้งหมด</option>
                    <option>อนุมัติแล้ว</option>
                    <option>อยู่ระหว่างตรวจสอบ</option>
                    <option>รออนุมัติ</option>
                    <option>ไม่อนุมัติ</option>
                  </select>
                </label>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                <MagnifyingGlassIcon className="w-5 h-5" />
                ค้นหา
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">รายการคำขอ</h2>
                <p className="text-sm text-slate-500">แสดงคำขอใช้ยานพาหนะล่าสุด</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 text-left font-medium">ลำดับ</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่</th>
                    <th className="px-4 py-3 text-left font-medium">หัวข้อ</th>
                    <th className="px-4 py-3 text-left font-medium">ปลายทาง</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4">{row.id}</td>
                      <td className="px-4 py-4">
                        {formatThaiFull(toDate(row.date))}
                      </td>
                      <td className="px-4 py-4 max-w-xs truncate">{row.subject}</td>
                      <td className="px-4 py-4">{row.destination}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status] || "bg-slate-100 text-slate-700"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <button className="rounded-full p-2 hover:bg-slate-100">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="rounded-full p-2 hover:bg-slate-100">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button className="rounded-full p-2 hover:bg-slate-100 text-red-500">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
