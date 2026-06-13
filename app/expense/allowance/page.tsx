"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ExpenseItem {
  item_id: number;
  claim_id: number;
  item_name: string;
  item_date: string | null;
  amount: number;
  unit: string | null;
  quantity: number;
  receipt_number: string | null;
}

interface ExpenseClaim {
  claim_id: number;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  description: string | null;
  status: string;
  expense_categories: { cat_name: string; cat_code: string } | null;
  expense_items: ExpenseItem[];
  users: { full_name: string; position: string };
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

export default function AllowancePage() {
  const [collapsed, setCollapsed] = useState(false);
  const [fiscalYear, setFiscalYear] = useState("2569");
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state สำหรับเพิ่ม/แก้ไข expense_item
  const [form, setForm] = useState({
    item_name: "",
    item_date: "",
    amount: "",
    unit: "",
    quantity: "1",
    receipt_number: "",
  });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [targetClaimId, setTargetClaimId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: ExpenseItem, claimId: number) => {
    setForm({
      item_name: item.item_name,
      item_date: item.item_date ? item.item_date.split("T")[0] : "",
      amount: String(item.amount),
      unit: item.unit ?? "",
      quantity: String(item.quantity),
      receipt_number: item.receipt_number ?? "",
    });
    setEditingItemId(item.item_id);
    setTargetClaimId(claimId);
  };

  const handleDelete = async (claimId: number) => {
    if (!confirm("คุณต้องการลบใบเบิกนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/expense-claims/${claimId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      setClaims((prev) => prev.filter((c) => c.claim_id !== claimId));
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + String(err));
    }
  };

  const handleSave = async () => {
    if (!form.item_name.trim() || !form.amount) return;
    if (!targetClaimId) return;

    setSaving(true);
    try {
      if (editingItemId) {
        // แก้ไข expense_item ผ่าน API (ใช้ PUT claim แล้ว recalc)
        // สำหรับตอนนี้ใช้การ update claim โดยตรง
        alert("ฟีเจอร์แก้ไขรายการย่อยจะพัฒนาเพิ่มเติม");
      } else {
        // สร้าง claim ใหม่พร้อม item
        const payload = {
          claimant_id: 1, // TODO: ดึงจาก session
          claim_date: form.item_date || new Date().toISOString().split("T")[0],
          items: [{
            item_name: form.item_name,
            item_date: form.item_date || null,
            amount: parseFloat(form.amount),
            unit: form.unit || null,
            quantity: parseFloat(form.quantity) || 1,
            receipt_number: form.receipt_number || null,
          }],
        };
        const res = await fetch("/api/expense-claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
        await fetchData();
      }
      setForm({ item_name: "", item_date: "", amount: "", unit: "", quantity: "1", receipt_number: "" });
      setEditingItemId(null);
      setTargetClaimId(null);
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  // คำนวณยอดรวมทั้งหมด
  const totalAmount = claims.reduce((s, c) => s + Number(c.total_amount), 0);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="expense" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="รายละเอียดเบี้ยเลี้ยง" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">รายละเอียดใบเบิกค่าใช้จ่าย</h1>
                <p className="mt-2 text-sm text-slate-500">ตรวจสอบรายการใบเบิกทั้งหมดอย่างละเอียด</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-slate-500">ปีงบประมาณ</span>
                  <select
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    {fiscalYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
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
            {/* FORM เพิ่ม/แก้ไข */}
            <div className="xl:col-span-1 bg-white rounded-3xl shadow p-6">
              <h2 className="text-lg font-semibold">เพิ่มใบเบิกใหม่</h2>
              <div className="mt-5 space-y-4">
                <LabelInput
                  label="ชื่อรายการ"
                  value={form.item_name}
                  onChange={(v) => handleChange("item_name", v)}
                />
                <LabelInput
                  label="วันที่"
                  type="date"
                  value={form.item_date}
                  onChange={(v) => handleChange("item_date", v)}
                />
                <LabelInput
                  label="จำนวนเงิน (บาท)"
                  type="number"
                  value={form.amount}
                  onChange={(v) => handleChange("amount", v)}
                />
                <LabelInput
                  label="หน่วย"
                  value={form.unit}
                  onChange={(v) => handleChange("unit", v)}
                />
                <LabelInput
                  label="จำนวน"
                  type="number"
                  value={form.quantity}
                  onChange={(v) => handleChange("quantity", v)}
                />
                <LabelInput
                  label="เลขที่ใบเสร็จ"
                  value={form.receipt_number}
                  onChange={(v) => handleChange("receipt_number", v)}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? "กำลังบันทึก..." : editingItemId ? "บันทึกการแก้ไข" : "เพิ่มรายการ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ item_name: "", item_date: "", amount: "", unit: "", quantity: "1", receipt_number: "" });
                      setEditingItemId(null);
                      setTargetClaimId(null);
                    }}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ล้าง
                  </button>
                </div>
              </div>
            </div>

            {/* ตารางรายการ */}
            <div className="xl:col-span-2 bg-white rounded-3xl shadow p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold">รายการใบเบิกทั้งหมด</h2>
                  <p className="text-sm text-slate-500">สรุปยอดเงินทั้งหมด</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-5 py-3 text-lg font-semibold text-slate-700">
                  {totalAmount.toLocaleString()} บาท
                </div>
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
                        <th className="px-4 py-3 text-left font-medium">ยอดรวม (บาท)</th>
                        <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                        <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {claims.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-400 italic">
                            ไม่มีข้อมูลในปีงบประมาณที่เลือก
                          </td>
                        </tr>
                      ) : (
                        claims.map((claim) => {
                          const statusThai = statusThaiMap[claim.status] ?? claim.status;
                          return (
                            <tr key={claim.claim_id}>
                              <td className="px-4 py-4 font-mono text-xs">{claim.claim_number}</td>
                              <td className="px-4 py-4">{formatDate(claim.claim_date)}</td>
                              <td className="px-4 py-4">{claim.expense_categories?.cat_name ?? "อื่นๆ"}</td>
                              <td className="px-4 py-4">{claim.users?.full_name ?? "-"}</td>
                              <td className="px-4 py-4">{Number(claim.total_amount).toLocaleString()}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[statusThai] ?? "bg-slate-100 text-slate-700"}`}>
                                  {statusThai}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => claim.expense_items[0] && handleEdit(claim.expense_items[0], claim.claim_id)}
                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                                    title="แก้ไข"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(claim.claim_id)}
                                    className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                    title="ลบ"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
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
    </div>
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
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
