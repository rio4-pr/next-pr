"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import {
  BanknotesIcon,
  CalculatorIcon,
  TruckIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface ExpenseClaim {
  claim_id: number;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  description: string | null;
  status: string;
  created_at: string;
  users: {
    user_id: number;
    full_name: string;
    position: string;
    department: string;
  };
  expense_categories: {
    cat_id: number;
    cat_name: string;
    cat_code: string;
  } | null;
  expense_items: {
    item_id: number;
    item_name: string;
    amount: number;
    quantity: number;
  }[];
}

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "รอตรวจสอบ": "bg-yellow-50 text-yellow-700",
  "ร่าง": "bg-slate-50 text-slate-700",
  "จ่ายแล้ว": "bg-blue-50 text-blue-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

const statusThaiMap: Record<string, string> = {
  approved: "อนุมัติแล้ว",
  submitted: "รอตรวจสอบ",
  draft: "ร่าง",
  paid: "จ่ายแล้ว",
  rejected: "ไม่อนุมัติ",
};

const fiscalYears = ["2566", "2567", "2568", "2569"];

export default function ExpensePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [fiscalYear, setFiscalYear] = useState("2569");
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ fiscal_year: fiscalYear });
      const res = await fetch(`/api/expense-claims?${params.toString()}`);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setClaims(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [fiscalYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // คำนวณยอดรวมตามหมวดหมู่
  const totalAmount = claims.reduce((s, c) => s + Number(c.total_amount), 0);

  // จัดกลุ่มตามหมวดหมู่
  const catTotals = claims.reduce<Record<string, number>>((acc, c) => {
    const key = c.expense_categories?.cat_name ?? "อื่นๆ";
    acc[key] = (acc[key] ?? 0) + Number(c.total_amount);
    return acc;
  }, {});

  const allowanceTotal = catTotals["เบี้ยเลี้ยง"] ?? 0;
  const accommodationTotal = catTotals["ค่าที่พัก"] ?? 0;
  const transportTotal = catTotals["ค่าพาหนะ"] ?? 0;

  const summaryCards = [
    { label: "ค่าใช้จ่ายทั้งหมด", value: totalAmount.toLocaleString(), icon: <CalculatorIcon className="w-6 h-6" /> },
    { label: "เบี้ยเลี้ยง", value: allowanceTotal.toLocaleString(), icon: <BanknotesIcon className="w-6 h-6" /> },
    { label: "ค่าที่พัก", value: accommodationTotal.toLocaleString(), icon: <BuildingOffice2Icon className="w-6 h-6" /> },
    { label: "ค่าพาหนะ", value: transportTotal.toLocaleString(), icon: <TruckIcon className="w-6 h-6" /> },
  ];

  // สรุปสถิติ
  const allowanceClaims = claims.filter(c => c.expense_categories?.cat_name === "เบี้ยเลี้ยง");
  const travelDays = allowanceClaims.reduce((s, c) =>
    s + c.expense_items.reduce((si, i) => si + (i.quantity ?? 1), 0), 0);
  const avgPerDay = travelDays > 0 ? Math.round(allowanceTotal / travelDays) : 0;
  const approvedCount = claims.filter(c => c.status === "approved").length;

  const allowanceCards = [
    { label: "เบี้ยเลี้ยงรวม", value: allowanceTotal.toLocaleString() },
    { label: "วันเดินทาง", value: `${travelDays} วัน` },
    { label: "อัตราเฉลี่ยต่อวัน", value: avgPerDay.toLocaleString() },
    { label: "อนุมัติแล้ว", value: `${approvedCount} รายการ` },
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

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
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {fiscalYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
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
                <h2 className="text-lg font-semibold">รายละเอียดใบเบิกค่าใช้จ่าย</h2>
                <p className="text-sm text-slate-500">รายการใบเบิกล่าสุดพร้อมสถานะ</p>
              </div>
              <Link
                href="/expense/allowance"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                ดูรายละเอียดทั้งหมด
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500">กำลังโหลดข้อมูล...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-4 py-3 text-left font-medium">เลขที่ใบเบิก</th>
                      <th className="px-4 py-3 text-left font-medium">วันที่</th>
                      <th className="px-4 py-3 text-left font-medium">หมวดหมู่</th>
                      <th className="px-4 py-3 text-left font-medium">ผู้เบิก</th>
                      <th className="px-4 py-3 text-left font-medium">จำนวนเงิน (บาท)</th>
                      <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {claims.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400 italic">
                          ไม่มีข้อมูลในปีงบประมาณที่เลือก
                        </td>
                      </tr>
                    ) : (
                      claims.slice(0, 10).map((row) => {
                        const statusThai = statusThaiMap[row.status] ?? row.status;
                        return (
                          <tr key={row.claim_id}>
                            <td className="px-4 py-4 font-mono text-xs">{row.claim_number}</td>
                            <td className="px-4 py-4">{formatDate(row.claim_date)}</td>
                            <td className="px-4 py-4">{row.expense_categories?.cat_name ?? "อื่นๆ"}</td>
                            <td className="px-4 py-4">{row.users?.full_name ?? "-"}</td>
                            <td className="px-4 py-4">{Number(row.total_amount).toLocaleString()}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[statusThai] ?? "bg-slate-100 text-slate-700"}`}>
                                {statusThai}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
