"use client";
import { useState, useId, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ThaiDatePicker from "@/app/components/ThaiDatePicker";

interface User {
  user_id: number;
  full_name: string;
  position: string;
  department: string;
}

const today = new Date().toISOString().split("T")[0];

const initialForm = {
  requester_id: 0,
  purpose: "",
  destination: "",
  start_date: today,
  start_time: "08:00",
  end_date: today,
  end_time: "17:00",
  passenger_count: 1,
  travel_request_id: "",
};

type FormType = typeof initialForm;

// แยก component ที่ใช้ useSearchParams ออกมาเพื่อ wrap ใน Suspense
function CreateVehicleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [form, setForm] = useState<FormType>(initialForm);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // โหลดรายชื่อผู้ใช้
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error);
  }, []);

  // โหลดข้อมูลเดิมถ้าเป็นการแก้ไข
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    fetch(`/api/vehicle-requests/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        const startDt = new Date(data.start_datetime);
        const endDt = new Date(data.end_datetime);
        setForm({
          requester_id: data.requester_id,
          purpose: data.purpose,
          destination: data.destination,
          start_date: startDt.toISOString().split("T")[0],
          start_time: startDt.toTimeString().slice(0, 5),
          end_date: endDt.toISOString().split("T")[0],
          end_time: endDt.toTimeString().slice(0, 5),
          passenger_count: data.passenger_count,
          travel_request_id: data.travel_request_id?.toString() ?? "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [editId]);

  const handleChange = (field: keyof FormType, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.requester_id) {
      setError("กรุณาเลือกผู้ขอใช้ยานพาหนะ");
      return;
    }
    if (!form.purpose.trim()) {
      setError("กรุณากรอกวัตถุประสงค์");
      return;
    }
    if (!form.destination.trim()) {
      setError("กรุณากรอกปลายทาง");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        requester_id: form.requester_id,
        purpose: form.purpose,
        destination: form.destination,
        start_datetime: `${form.start_date}T${form.start_time}:00`,
        end_datetime: `${form.end_date}T${form.end_time}:00`,
        passenger_count: form.passenger_count,
        travel_request_id: form.travel_request_id
          ? parseInt(form.travel_request_id)
          : null,
      };

      const url = editId
        ? `/api/vehicle-requests/${editId}`
        : "/api/vehicle-requests";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "บันทึกไม่สำเร็จ");
      }

      alert(editId ? "แก้ไขคำขอสำเร็จ" : "สร้างคำขอสำเร็จ");
      router.push("/vehicle");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <AppSidebar collapsed={false} activePage="vehicle" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AppSidebar collapsed={false} activePage="vehicle" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => {}} title={editId ? "แก้ไขคำขออนุญาตใช้ยานพาหนะส่วนกลาง" : "สร้างคำขออนุญาตใช้ยานพาหนะส่วนกลาง"} />

        <div className="p-6 space-y-6">
          {/* HEADER */}
          <div className="bg-white rounded-3xl shadow p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">
                {editId ? "แก้ไขคำขออนุญาตใช้ยานพาหนะส่วนกลาง" : "แบบฟอร์มคำขออนุญาตใช้ยานพาหนะส่วนกลาง"}
              </h1>
            </div>
            <Link href="/vehicle" className="btn-back inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
              <ArrowLeftIcon className="w-4 h-4" />
              ย้อนกลับ
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <div className="grid gap-6">
            {/* ข้อมูลผู้ขอ */}
            <Section title="ข้อมูลผู้ขอ">
              <div>
                <label className="text-sm font-medium">ผู้ขอใช้ยานพาหนะ <span className="text-red-500">*</span></label>
                <select
                  value={form.requester_id}
                  onChange={(e) => handleChange("requester_id", parseInt(e.target.value))}
                  className="input mt-1"
                >
                  <option value={0}>-- เลือกผู้ขอ --</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name} ({u.position})
                    </option>
                  ))}
                </select>
              </div>
              <LabelInput
                label="จำนวนผู้โดยสาร"
                type="number"
                value={String(form.passenger_count)}
                onChange={(v: string) => handleChange("passenger_count", parseInt(v) || 1)}
              />
            </Section>

            {/* วัตถุประสงค์และปลายทาง */}
            <Section title="รายละเอียดการเดินทาง">
              <TextAreaInput
                label="วัตถุประสงค์ *"
                value={form.purpose}
                onChange={(v: string) => handleChange("purpose", v)}
              />
              <LabelInput
                label="ปลายทาง *"
                value={form.destination}
                onChange={(v: string) => handleChange("destination", v)}
              />
            </Section>

            {/* วันเวลา */}
            <Section title="วัน-เวลาการใช้ยานพาหนะ">
              <ThaiDatePicker
                id="start_date"
                label="วันที่ออก"
                value={form.start_date}
                onChange={(v) => handleChange("start_date", v)}
              />
              <LabelInput
                type="time"
                label="เวลาออก"
                value={form.start_time}
                onChange={(v: string) => handleChange("start_time", v)}
              />
              <ThaiDatePicker
                id="end_date"
                label="วันที่กลับ"
                value={form.end_date}
                onChange={(v) => handleChange("end_date", v)}
              />
              <LabelInput
                type="time"
                label="เวลากลับ"
                value={form.end_time}
                onChange={(v: string) => handleChange("end_time", v)}
              />
            </Section>

            {/* อ้างอิงคำขอเดินทาง */}
            <Section title="ข้อมูลเพิ่มเติม">
              <LabelInput
                label="รหัสคำขอเดินทาง (ถ้ามี)"
                type="number"
                value={form.travel_request_id}
                onChange={(v: string) => handleChange("travel_request_id", v)}
              />
            </Section>
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3">
            <Link href="/vehicle" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              ยกเลิก
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : editId ? "บันทึกการแก้ไข" : "บันทึกคำขอ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export ที่ wrap ด้วย Suspense
export default function CreateVehiclePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">กำลังโหลด...</p>
      </div>
    }>
      <CreateVehicleForm />
    </Suspense>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function LabelInput({ label, value, onChange, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
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
        className="input mt-1"
      />
    </div>
  );
}

function TextAreaInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
        className="input h-28 mt-1"
      />
    </div>
  );
}
