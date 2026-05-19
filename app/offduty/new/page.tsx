"use client";

import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const initialForm = {
  office: "สำนักงานชลประทานที่ 4",
  date: "24 มิถุนายน 2568",
  amount: "2,060",
  subject: "ขออนุมัติเบิกค่าใช้จ่ายในการเดินทางไปราชการ",
  to: "อธิบดีกรมชลประทาน",
  order: "สขป4.01ธก(ขป318)/74/2568",
  orderDate: "17 มิถุนายน 2568",
  requester: "นายภาณุพงษ์ เชื้อดีสืบ",
  position: "นายช่างภาพ",
  department: "ส่วนบริหารทั่วไป สำนักงานชลประทานที่ 4",
  companion: "นายธนวินท์ จันบุญลี ตำแหน่ง เจ้าพนักงานเครื่องพนักงานคอมพิวเตอร์",
  travelPlace: "กรมชลประทานสามเสน และสชป.11",
  purpose: "ติดต่อราชการ และอบรมเชิงปฏิบัติการเทคนิคการออกแบบ Infographic",
  departFrom: "บ้าน",
  departDate: "18 มิถุนายน 2568",
  departTime: "08:30",
  returnDate: "20 มิถุนายน 2568",
  returnTime: "21:30",
  duration: "2 วัน 13 ชั่วโมง",
  expenseAllowance: "960",
  expenseLodging: "1,100",
  expenseTransport: "0",
  expenseOther: "0",
  totalAmount: "2,060",
  totalText: "สองพันหกสิบบาทถ้วน",
  approvalAmount: "2,060",
  approver: "นายภาณุพงษ์ เชื้อดีสืบ",
  approverPosition: "นายช่างภาพ",
};

export default function NewOffDutyPage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={false} activePage="travel" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => {}} title="สร้างคำขอไปราชการ" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">แบบฟอร์มคำขอไปราชการ</h1>
                <p className="mt-2 text-sm text-slate-500">กรอกข้อมูลตามภาพตัวอย่างและส่งคำขอ</p>
              </div>
              <Link href="/offduty" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                <ArrowLeftIcon className="w-4 h-4" />
                ย้อนกลับ
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="bg-white rounded-3xl shadow p-6 space-y-5">
              <h2 className="text-lg font-semibold">ข้อมูลทั่วไป</h2>
              <LabelInput label="ที่ทำการ" value={form.office} onChange={(value) => handleChange("office", value)} />
              <LabelInput label="วันที่" value={form.date} onChange={(value) => handleChange("date", value)} />
              <LabelInput label="จำนวนเงิน (บาท)" value={form.amount} onChange={(value) => handleChange("amount", value)} />
              <LabelInput label="เรื่อง" value={form.subject} onChange={(value) => handleChange("subject", value)} />
              <LabelInput label="เรียน" value={form.to} onChange={(value) => handleChange("to", value)} />
              <LabelInput label="คำสั่ง/บันทึกที่" value={form.order} onChange={(value) => handleChange("order", value)} />
              <LabelInput label="ลงวันที่" value={form.orderDate} onChange={(value) => handleChange("orderDate", value)} />
            </div>

            <div className="bg-white rounded-3xl shadow p-6 space-y-5">
              <h2 className="text-lg font-semibold">ข้อมูลผู้ขอ</h2>
              <LabelInput label="ข้าพเจ้า" value={form.requester} onChange={(value) => handleChange("requester", value)} />
              <LabelInput label="ตำแหน่ง" value={form.position} onChange={(value) => handleChange("position", value)} />
              <LabelInput label="สังกัด" value={form.department} onChange={(value) => handleChange("department", value)} />
              <LabelInput label="พร้อมด้วย" value={form.companion} onChange={(value) => handleChange("companion", value)} />
              <LabelInput label="เดินทางไปปฏิบัติราชการที่" value={form.travelPlace} onChange={(value) => handleChange("travelPlace", value)} />
              <LabelInput label="ติดต่อราชการ" value={form.purpose} onChange={(value) => handleChange("purpose", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">รายละเอียดการเดินทาง</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="block">
                <span className="text-sm font-medium text-slate-700">ออกเดินทางจาก</span>
                <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {(["บ้าน", "สำนัก"] as const).map((option) => (
                    <label key={option} className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50">
                      <input
                        type="radio"
                        name="departFrom"
                        value={option}
                        checked={form.departFrom === option}
                        onChange={() => handleChange("departFrom", option)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <LabelInput label="ตั้งแต่วันที่" value={form.departDate} onChange={(value) => handleChange("departDate", value)} />
              <LabelInput label="เวลา" value={form.departTime} onChange={(value) => handleChange("departTime", value)} />
              <LabelInput label="กลับถึง" value={form.returnDate} onChange={(value) => handleChange("returnDate", value)} />
              <LabelInput label="เวลา" value={form.returnTime} onChange={(value) => handleChange("returnTime", value)} />
              <LabelInput label="รวมเวลา" value={form.duration} onChange={(value) => handleChange("duration", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">ค่าใช้จ่าย</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <LabelInput label="ค่าเบี้ยเลี้ยงเดินทาง" value={form.expenseAllowance} onChange={(value) => handleChange("expenseAllowance", value)} />
              <LabelInput label="ค่าเช่าที่พัก" value={form.expenseLodging} onChange={(value) => handleChange("expenseLodging", value)} />
              <LabelInput label="ค่าพาหนะ" value={form.expenseTransport} onChange={(value) => handleChange("expenseTransport", value)} />
              <LabelInput label="ค่าใช้จ่ายอื่น" value={form.expenseOther} onChange={(value) => handleChange("expenseOther", value)} />
              <LabelInput label="จำนวนเงิน (ตัวอักษร)" value={form.totalText} onChange={(value) => handleChange("totalText", value)} />
              <LabelInput label="รวมทั้งสิ้น" value={form.totalAmount} onChange={(value) => handleChange("totalAmount", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">การอนุมัติ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <LabelInput label="จำนวนเงินอนุมัติ" value={form.approvalAmount} onChange={(value) => handleChange("approvalAmount", value)} />
              <LabelInput label="ผู้ขอรับเงิน" value={form.approver} onChange={(value) => handleChange("approver", value)} />
              <LabelInput label="ตำแหน่ง" value={form.approverPosition} onChange={(value) => handleChange("approverPosition", value)} />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button className="inline-flex items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition">
              ยกเลิก
            </button>
            <button className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
              บันทึกคำขอ
            </button>
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
