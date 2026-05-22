"use client";
import Link from "next/link";
import { useState } from "react";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import { ArrowLeftIcon, BanknotesIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const fiscalYear = "2568";
const initialAllowanceBreakdown = [
  { id: "EXP-001", date: "2025-06-18", type: "อบรม", detail: "เบี้ยเลี้ยงเดินทาง", amount: "960" },
  { id: "EXP-002", date: "2025-06-19", type: "ค่าผ่านทาง", detail: "ค่าทางด่วน", amount: "1,080" },
  { id: "EXP-003", date: "2025-06-20", type: "อบรม", detail: "เบี้ยเลี้ยงเดินทาง", amount: "1,080" },
  { id: "EXP-004", date: "2025-06-21", type: "ไม่เบิก", detail: "ไม่เบิกเบี้ยเลี้ยง", amount: "0" },
];

export default function AllowancePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [allowances, setAllowances] = useState(initialAllowanceBreakdown);
  const [form, setForm] = useState({ id: "", date: "", type: "", detail: "", amount: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (entry: typeof form) => {
    setForm(entry);
    setEditingId(entry.id);
  };

  const handleDelete = (id: string) => {
    setAllowances((prev) => prev.filter((entry) => entry.id !== id));
    if (editingId === id) {
      setForm({ id: "", date: "", type: "", detail: "", amount: "" });
      setEditingId(null);
    }
  };

  const handleSave = () => {
    if (!form.date || !form.type) return;
    if (form.type !== "ไม่เบิก" && !form.amount) return;

    const savedEntry = {
      ...form,
      amount: form.type === "ไม่เบิก" ? "0" : form.amount,
    };

    if (editingId) {
      setAllowances((prev) => prev.map((entry) => (entry.id === editingId ? savedEntry : entry)));
    } else {
      const nextId = `EXP-${String(allowances.length + 1).padStart(3, "0")}`;
      setAllowances((prev) => [...prev, { ...savedEntry, id: nextId }]);
    }
    setForm({ id: "", date: "", type: "", detail: "", amount: "" });
    setEditingId(null);
  };

  const totalAmount = allowances.reduce((sum, item) => sum + Number(item.amount.replace(/,/g, "")), 0);

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="expense" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="รายละเอียดเบี้ยเลี้ยง" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">รายละเอียดเบี้ยเลี้ยง ปีงบประมาณ {fiscalYear}</h1>
                <p className="mt-2 text-sm text-slate-500">ตรวจสอบรายการเบี้ยเลี้ยงทั้งหมดอย่างละเอียด</p>
              </div>
              <Link
                href="/expense"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                ย้อนกลับ
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-1 bg-white rounded-3xl shadow p-6">
              <h2 className="text-lg font-semibold">เพิ่ม / แก้ไข</h2>
              <div className="mt-5 space-y-4">
                <LabelInput label="วันที่" type="date" value={form.date} onChange={(value) => handleChange("date", value)} />
                <SelectInput
                  label="ประเภทเบิกเบี้ยเลี้ยง"
                  value={form.type}
                  onChange={(value) => handleChange("type", value)}
                  options={[
                    { value: "", label: "เลือกประเภท" },
                    { value: "อบรม", label: "อบรม" },
                    { value: "ค่าผ่านทาง", label: "ค่าผ่านทาง" },
                    { value: "ไม่เบิก", label: "ไม่เบิก" },
                  ]}
                />
                <LabelInput label="รายละเอียด" value={form.detail} onChange={(value) => handleChange("detail", value)} />
                <LabelInput
                  label="จำนวนเงิน"
                  type="number"
                  value={form.type === "ไม่เบิก" ? "0" : form.amount}
                  onChange={(value) => handleChange("amount", value)}
                  disabled={form.type === "ไม่เบิก"}
                  placeholder={form.type === "ไม่เบิก" ? "0" : "กรอกจำนวนเงิน"}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    {editingId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ id: "", date: "", type: "", detail: "", amount: "" });
                      setEditingId(null);
                    }}
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
                  <h2 className="text-lg font-semibold">เบี้ยเลี้ยงรวม</h2>
                  <p className="text-sm text-slate-500">สรุปยอดเงินเบี้ยเลี้ยงทั้งหมด</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-5 py-3 text-lg font-semibold text-slate-700">{totalAmount.toLocaleString()} บาท</div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-4 py-3 text-left font-medium">รหัส</th>
                      <th className="px-4 py-3 text-left font-medium">วันที่</th>
                      <th className="px-4 py-3 text-left font-medium">ประเภท</th>
                      <th className="px-4 py-3 text-left font-medium">รายละเอียด</th>
                      <th className="px-4 py-3 text-left font-medium">จำนวนเงิน</th>
                      <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {allowances.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-4">{row.id}</td>
                        <td className="px-4 py-4">{row.date}</td>
                        <td className="px-4 py-4">{row.type}</td>
                        <td className="px-4 py-4 max-w-xs truncate">{row.detail}</td>
                        <td className="px-4 py-4">{row.amount} บาท</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(row)}
                              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
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

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LabelInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
