"use client";

import { useState } from "react";
import AppSidebar from "../../components/AppSidebar";
import Header from "../../components/Header";
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const reportSummary = [
  { label: "ข่าวทั้งหมด", value: 24, icon: <DocumentTextIcon className="w-6 h-6" /> },
  { label: "ข่าววันนี้", value: 12, icon: <CalendarDaysIcon className="w-6 h-6" /> },
  { label: "รอดำเนินการ", value: 8, icon: <ClockIcon className="w-6 h-6" /> },
  { label: "ไม่อนุมัติ", value: 4, icon: <XMarkIcon className="w-6 h-6" /> },
];

const rows = [
  {
    id: 1,
    date: "21 พ.ค. 2567 09:30",
    title: "สถานการณ์ฝนตกชุกในพื้นที่",
    source: "กองอำนวยการ",
    importance: "ด่วนมาก",
    status: "อนุมัติแล้ว",
  },
  {
    id: 2,
    date: "21 พ.ค. 2567 09:15",
    title: "การประชุมเตรียมพร้อมน้ำท่วม",
    source: "กองแผนงาน",
    importance: "ด่วน",
    status: "อยู่ระหว่างตรวจสอบ",
  },
  {
    id: 3,
    date: "20 พ.ค. 2567 17:45",
    title: "มอบหมายงานจัดสถานที่",
    source: "ศูนย์ฯ ชป.4",
    importance: "ปกติ",
    status: "อนุมัติแล้ว",
  },
  {
    id: 4,
    date: "20 พ.ค. 2567 14:20",
    title: "สำรวจปริมาณน้ำในเขื่อน",
    source: "สนง.ชลประทาน",
    importance: "ปกติ",
    status: "รออนุมัติ",
  },
  {
    id: 5,
    date: "20 พ.ค. 2567 10:10",
    title: "แผนการจัดส่งรถปฏิบัติการ",
    source: "ศูนย์ปฏิบัติการ",
    importance: "ด่วน",
    status: "ไม่อนุมัติ",
  },
];

const badgeStyles: Record<string, string> = {
  "ด่วนมาก": "bg-red-50 text-red-600",
  ด่วน: "bg-orange-50 text-orange-600",
  ปกติ: "bg-emerald-50 text-emerald-600",
  "รออนุมัติ": "bg-yellow-50 text-yellow-600",
};

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "อยู่ระหว่างตรวจสอบ": "bg-blue-50 text-blue-700",
  "รออนุมัติ": "bg-yellow-50 text-yellow-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

export default function NewsReport() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="newsreport" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="สรุปรายงานข่าว" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold mt-2">สรุปรายงานข่าว</h1>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                  <CalendarIcon className="w-4 h-4" />
                  01/05/2567 - 21/05/2567
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 transition">
                  <FunnelIcon className="w-4 h-4" />
                  กรองข้อมูล
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6 xl:grid-cols-4">
              {reportSummary.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ค้นหา</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อข่าว, หัวข้อข่าว, แหล่งข่าว..."
                      className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ช่วงวันที่</span>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    01/05/2567 - 21/05/2567
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">สถานะ</span>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    ทั้งหมด
                  </div>
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
                <h2 className="text-lg font-semibold">รายการข่าว</h2>
                <p className="text-sm text-slate-500">แสดงข้อมูลข่าวสารล่าสุด</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Excel
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 text-left font-medium">ลำดับ</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่/เวลา</th>
                    <th className="px-4 py-3 text-left font-medium">หัวข้อข่าว</th>
                    <th className="px-4 py-3 text-left font-medium">แหล่งข่าว</th>
                    <th className="px-4 py-3 text-left font-medium">ระดับความสำคัญ</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4">{row.id}</td>
                      <td className="px-4 py-4">{row.date}</td>
                      <td className="px-4 py-4 max-w-xs truncate">{row.title}</td>
                      <td className="px-4 py-4">{row.source}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[row.importance] || "bg-slate-100 text-slate-700"}`}>
                          {row.importance}
                        </span>
                      </td>
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

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">แสดง 1-5 จาก 24 รายการ</p>
              <div className="flex items-center gap-2">
                <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">1</button>
                <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">2</button>
                <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">3</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
