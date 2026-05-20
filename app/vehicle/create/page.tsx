"use client";
import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const initialForm = {
  department: "สำนักงานชลประทานที่ 4",
  requestDate: "20 มิถุนายน 2568",
  subject: "ขอยืมยานพาหนะ",
  vehicleType: "รถบรรทุก 1 ตัน",
  destination: "กรมชลประทานสามเสนและ สชป.11",
  passengers: "1 คน",
  purpose: "ติดต่อราชการ",
  requester: "นายภาณุพงษ์ เชื้อดีสืบ",
  position: "นายช่างภาพ",
  telephone: "09x-xxx-xxxx",
  travelStartDate: "18 มิถุนายน 2568",
  travelStartTime: "08:30",
  travelEndDate: "20 มิถุนายน 2568",
  travelEndTime: "21:30",
  vehicleDate: "18 มิถุนายน 2568",
  vehicleOrigin: "สำนักงานชลประทานที่ 4",
  vehiclePurpose: "ลงพื้นที่ตรวจงานและประชุมหน่วย",
  approvalNote: "",
};

export default function CreateVehiclePage() {
  const [form, setForm] = useState(initialForm);

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={false} activePage="vehicle" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => {}} title="สร้างคำขอยืมยานพาหนะ" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">แบบฟอร์มคำขอยืมยานพาหนะ</h1>
                <p className="mt-2 text-sm text-slate-500">กรอกข้อมูลคำขอยืมพาหนะตามรูปแบบ</p>
              </div>
              <Link href="/vehicle" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                <ArrowLeftIcon className="w-4 h-4" />
                ย้อนกลับ
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="bg-white rounded-3xl shadow p-6 space-y-5">
              <h2 className="text-lg font-semibold">ข้อมูลคำขอ</h2>
              <LabelInput label="หน่วยงาน" value={form.department} onChange={(value) => handleChange("department", value)} />
              <LabelInput label="วันที่" value={form.requestDate} onChange={(value) => handleChange("requestDate", value)} />
              <LabelInput label="เรื่อง" value={form.subject} onChange={(value) => handleChange("subject", value)} />
              <LabelInput label="ประเภทยานพาหนะ" value={form.vehicleType} onChange={(value) => handleChange("vehicleType", value)} />
              <LabelInput label="ไปที่" value={form.destination} onChange={(value) => handleChange("destination", value)} />
              <LabelInput label="จำนวนคน" value={form.passengers} onChange={(value) => handleChange("passengers", value)} />
            </div>

            <div className="bg-white rounded-3xl shadow p-6 space-y-5">
              <h2 className="text-lg font-semibold">ข้อมูลผู้ขอ</h2>
              <LabelInput label="ข้าพเจ้า" value={form.requester} onChange={(value) => handleChange("requester", value)} />
              <LabelInput label="ตำแหน่ง" value={form.position} onChange={(value) => handleChange("position", value)} />
              <LabelInput label="โทรศัพท์" value={form.telephone} onChange={(value) => handleChange("telephone", value)} />
              <LabelInput label="เพื่อ" value={form.purpose} onChange={(value) => handleChange("purpose", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">รายละเอียดการเดินทาง</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <LabelInput label="ตั้งแต่วันที่" value={form.travelStartDate} onChange={(value) => handleChange("travelStartDate", value)} />
              <LabelInput label="เวลา" value={form.travelStartTime} onChange={(value) => handleChange("travelStartTime", value)} />
              <LabelInput label="ถึงวันที่" value={form.travelEndDate} onChange={(value) => handleChange("travelEndDate", value)} />
              <LabelInput label="เวลา" value={form.travelEndTime} onChange={(value) => handleChange("travelEndTime", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">ข้อมูลยานพาหนะ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <LabelInput label="ให้ยานพาหนะไปวันที่" value={form.vehicleDate} onChange={(value) => handleChange("vehicleDate", value)} />
              <LabelInput label="ออกจาก" value={form.vehicleOrigin} onChange={(value) => handleChange("vehicleOrigin", value)} />
              <TextAreaInput label="รายละเอียดการใช้ยานพาหนะ" value={form.vehiclePurpose} onChange={(value) => handleChange("vehiclePurpose", value)} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6 space-y-5">
            <h2 className="text-lg font-semibold">หมายเหตุ / อนุญาต</h2>
            <TextAreaInput label="หมายเหตุ" value={form.approvalNote} onChange={(value) => handleChange("approvalNote", value)} />
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

function TextAreaInput({
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
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
