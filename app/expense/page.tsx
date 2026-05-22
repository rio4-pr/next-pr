"use client";
import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import {
  BanknotesIcon,
  CalculatorIcon,
  TruckIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const summaryCards = [
  { label: "ค่าใช้จ่ายทั้งหมด", value: "7,320", icon: <CalculatorIcon className="w-6 h-6" /> },
  { label: "เบี้ยเลี้ยง", value: "4,320", icon: <BanknotesIcon className="w-6 h-6" /> },
  { label: "ค่าที่พัก", value: "1,500", icon: <BuildingOffice2Icon className="w-6 h-6" /> },
  { label: "ค่าพาหนะ", value: "1,200", icon: <TruckIcon className="w-6 h-6" /> },
];

const allowanceCards = [
  { label: "เบี้ยเลี้ยงรวม", value: "4,320" },
  { label: "วันเดินทาง", value: "4 วัน" },
  { label: "อัตราเฉลี่ยต่อวัน", value: "1,080" },
  { label: "สถานะการอนุมัติ", value: "อนุมัติแล้ว" },
];

const fiscalYears = ["2566", "2567", "2568", "2569"];

const allowanceDetails = [
  { id: "EXP-001", date: "18 มิ.ย. 2568", item: "เบี้ยเลี้ยงเดินทาง", amount: "960", status: "อนุมัติแล้ว" },
  { id: "EXP-002", date: "19 มิ.ย. 2568", item: "เบี้ยเลี้ยงเดินทาง", amount: "1,080", status: "อนุมัติแล้ว" },
  { id: "EXP-003", date: "20 มิ.ย. 2568", item: "เบี้ยเลี้ยงเดินทาง", amount: "1,080", status: "รอตรวจสอบ" },
  { id: "EXP-004", date: "21 มิ.ย. 2568", item: "เบี้ยเลี้ยงเดินทาง", amount: "1,200", status: "อนุมัติแล้ว" },
];

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "รอตรวจสอบ": "bg-yellow-50 text-yellow-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

export default function ExpensePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [fiscalYear, setFiscalYear] = useState("2568");

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="expense" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="ค่าใช้จ่าย" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">สรุปค่าใช้จ่าย ปีงบประมาณ {fiscalYear}</h1>
                <p className="mt-2 text-sm text-slate-500">ดูภาพรวมค่าใช้จ่ายทั้งหมด พร้อมเบี้ยเลี้ยงและรายละเอียดเพิ่มเติม</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-500">ปีงบประมาณ</span>
                  <select
                    value={fiscalYear}
                    onChange={(event) => setFiscalYear(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {fiscalYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/expense/allowance"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  ดูรายละเอียดเบี้ยเลี้ยง
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">เบี้ยเลี้ยง</h2>
                <p className="text-sm text-slate-500">สรุปรายละเอียดเบี้ยเลี้ยงเพื่อการตรวจสอบอย่างรวดเร็ว</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {allowanceCards.map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">รายละเอียดเบี้ยเลี้ยง</h2>
                <p className="text-sm text-slate-500">รายการบัญชีเบี้ยเลี้ยงล่าสุดพร้อมสถานะ</p>
              </div>
              <Link
                href="/expense/allowance"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                ดูรายละเอียดทั้งหมด
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 text-left font-medium">รหัส</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่</th>
                    <th className="px-4 py-3 text-left font-medium">รายการ</th>
                    <th className="px-4 py-3 text-left font-medium">จำนวนเงิน</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {allowanceDetails.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4">{row.id}</td>
                      <td className="px-4 py-4">{row.date}</td>
                      <td className="px-4 py-4 max-w-xs truncate">{row.item}</td>
                      <td className="px-4 py-4">{row.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status]}`}>
                          {row.status}
                        </span>
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
