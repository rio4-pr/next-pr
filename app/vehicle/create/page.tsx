"use client";
import { useState, useId } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ThaiDatePicker from "@/app/components/ThaiDatePicker";
import { toDate } from "@/app/utils/dateThai";

const today = new Date().toISOString().split("T")[0];

const initialForm = {
  department: "",
  requestDate: today,
  subject: "",
  salutation: "ผส.ชป.4 ผ่าน ผคก.ชป.4 ผบท.ชป.4 และปท.ชป.4",
  vehicleType: "รถบรรทุก 1 ตัน",
  destination: "กรมชลประทานสามเสน",
  passengers: "1 คน",
  purpose: "ติดต่อราชการ",
  requester: "นายภาณุพงษ์ เชื้อดีสืบ",
  position: "นายช่างภาพ",
  telephone: "09x-xxx-xxxx",
  travelStartDate: today,
  travelStartTime: "",
  travelEndDate: today,
  travelEndTime: "",
  vehicleDate: today,
  vehicleOrigin: "สำนักงานชลประทานที่ 4",
  vehiclePurpose: "ลงพื้นที่ตรวจงานและประชุมหน่วย",
  approvalNote: "",
};
type FormType = typeof initialForm;

export default function CreateVehiclePage() {
  const [form, setForm] = useState<FormType>(initialForm);

  const handleChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("FORM DATA:", form);
    alert("บันทึกข้อมูลสำเร็จ");
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={false} activePage="vehicle" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => { }} title="สร้างคำขออนุญาตใช้ยานพาหนะส่วนกลาง" />

        <div className="p-6 space-y-6">

          {/* HEADER */}
          <div className="bg-white rounded-3xl shadow p-6 flex justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                แบบฟอร์มคำขออนุญาตใช้ยานพาหนะส่วนกลาง
              </h1>
            </div>
            <Link href="/vehicle" className="btn-back">
              <ArrowLeftIcon className="w-4 h-4" />
              ย้อนกลับ
            </Link>
          </div>

          {/* FORM */}
          <div className="grid gap-6">

            {/* ข้อมูลคำขอ */}
            <Section title="ข้อมูลคำขอ">
              <LabelInput label="หน่วยงาน" value={form.department} onChange={(v: string) => handleChange("department", v)} />

              <ThaiDatePicker
                id="requestDate"
                label="วันที่"
                value={form.requestDate}
                onChange={(v) => handleChange("requestDate", v)}
              />

              <LabelInput label="เรื่อง" value={form.subject} onChange={(v: string) => handleChange("subject", v)} />
              <LabelInput label="เรียน" value={form.salutation} onChange={(v: string) => handleChange("salutation", v)} />
              <LabelInput label="ประเภทยานพาหนะ" value={form.vehicleType} onChange={(v: string) => handleChange("vehicleType", v)} />
              <LabelInput label="ไปที่" value={form.destination} onChange={(v: string) => handleChange("destination", v)} />
            </Section>

            {/* ผู้ขอ */}
            <Section title="ข้อมูลผู้ขอ">
              <LabelInput label="ข้าพเจ้า" value={form.requester} onChange={(v: string) => handleChange("requester", v)} />
              <LabelInput label="ตำแหน่ง" value={form.position} onChange={(v: string) => handleChange("position", v)} />
              <LabelInput label="โทรศัพท์" value={form.telephone} onChange={(v: string) => handleChange("telephone", v)} />
              <LabelInput label="เพื่อ" value={form.purpose} onChange={(v: string) => handleChange("purpose", v)} />
              <LabelInput label="จำนวนคน" value={form.passengers} onChange={(v: string) => handleChange("passengers", v)} />
            </Section>

            {/* เดินทาง */}
            <Section title="รายละเอียดการเดินทาง">
              <ThaiDatePicker id="travelStartDate" label="ตั้งแต่วันที่" value={form.travelStartDate} onChange={(v) => handleChange("travelStartDate", v)} />
              <LabelInput
                type="time"
                label="เวลาเริ่ม"
                value={form.travelStartTime}
                onChange={(v: string) => handleChange("travelStartTime", v)}
              />

              <ThaiDatePicker id="travelEndDate" label="ถึงวันที่" value={form.travelEndDate} onChange={(v) => handleChange("travelEndDate", v)} />
              <LabelInput
                type="time"
                label="เวลาเริ่ม"
                value={form.travelEndTime}
                onChange={(v: string) => handleChange("travelEndTime", v)}
              />
            </Section>

            {/* ยานพาหนะ */}
            <Section title="ข้อมูลยานพาหนะ">
              <ThaiDatePicker id="vehicleDate" label="ใช้ยานพาหนะวันที่" value={form.vehicleDate} onChange={(v) => handleChange("vehicleDate", v)} />
            </Section>

            {/* หมายเหตุ */}
            <Section title="หมายเหตุ">
              <TextAreaInput id="approvalNote" label="หมายเหตุ" value={form.approvalNote} onChange={(v: string) => handleChange("approvalNote", v)} />
            </Section>

          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3">
            <button className="btn-secondary">ยกเลิก</button>
            <button onClick={handleSubmit} className="btn-primary">
              บันทึกคำขอ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children }: any) {
  return (
    <div className="bg-white rounded-3xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function LabelInput({ label, value, onChange, type = "text" }: any) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

function TextAreaInput({ label, value, onChange }: any) {
  const id = useId();

  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input h-28"
      />
    </div>
  );
}
