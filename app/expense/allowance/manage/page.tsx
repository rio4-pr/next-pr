"use client";
import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const initialEntries = [
  { id: "EXP-001", date: "18 มิ.ย. 2568", detail: "เบี้ยเลี้ยงเดินทาง", amount: "960" },
  { id: "EXP-002", date: "19 มิ.ย. 2568", detail: "เบี้ยเลี้ยงเดินทาง", amount: "1,080" },
  { id: "EXP-003", date: "20 มิ.ย. 2568", detail: "เบี้ยเลี้ยงเดินทาง", amount: "1,080" },
];

export default function AllowanceManagePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState({ id: "", date: "", detail: "", amount: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (entry: typeof form) => {
    setForm(entry);
    setEditingId(entry.id);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (editingId === id) {
      handleClear();
    }
  };

  const handleSave = () => {
    if (!form.date || !form.detail || !form.amount) return;
    if (editingId) {
      setEntries((prev) => prev.map((entry) => (entry.id === editingId ? form : entry)));
    } else {
      const nextId = `EXP-${String(entries.length + 1).padStart(3, "0")}`;
      setEntries((prev) => [...prev, { ...form, id: nextId }]);
    }
    handleClear();
  };

  const handleClear = () => {
    setForm({ id: "", date: "", detail: "", amount: "" });
    setEditingId(null);
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="expense" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="จัดการเบี้ยเลี้ยง" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">จัดการรายการเบี้ยเลี้ยง</h1>
                <p className="mt-2 text-sm text-slate-500">เพิ่ม แก้ไข หรือลบรายการเบี้ยเลี้ยงได้ทันที</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/expense/allowance"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  ย้อนกลับ
                </Link>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  เพิ่มใหม่
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-1 bg-white rounded-3xl shadow p-6">
              <h2 className="text-lg font-semibold">แบบฟอร์มรายการ</h2>
              <div className="mt-5 space-y-4">
                <LabelInput label="วันที่" value={form.date} onChange={(value) => handleChange("date", value)} />
                <LabelInput label="รายละเอียด" value={form.detail} onChange={(value) => handleChange("detail", value)} />
                <LabelInput label="จำนวนเงิน" value={form.amount} onChange={(value) => handleChange("amount", value)} />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ล้าง
                  </button>
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-3xl shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold">รายการเบี้ยเลี้ยง</h2>
                  <p className="text-sm text-slate-500">จัดการรายการบันทึกเบี้ยเลี้ยงทั้งหมด</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{entries.length} รายการ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-4 py-3 text-left font-medium">รหัส</th>
                      <th className="px-4 py-3 text-left font-medium">วันที่</th>
                      <th className="px-4 py-3 text-left font-medium">รายละเอียด</th>
                      <th className="px-4 py-3 text-left font-medium">จำนวนเงิน</th>
                      <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-4">{entry.id}</td>
                        <td className="px-4 py-4">{entry.date}</td>
                        <td className="px-4 py-4 max-w-xs truncate">{entry.detail}</td>
                        <td className="px-4 py-4">{entry.amount}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
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
    </div>
  );
}

function LabelInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
