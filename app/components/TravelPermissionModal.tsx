"use client";

import { useState, useEffect } from "react";
import {
  TravelPermissionData,
  mockTravelData,
  TITLE_OPTIONS,
  DEPT_TYPE_OPTIONS,
} from "../offduty/travelperm";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import ThaiDatePicker from "./ThaiDatePicker";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: TravelPermissionData) => void;
  initialData?: TravelPermissionData | null;
  submitLabel?: string;
  readOnly?: boolean;
};

const DOCUMENT_NO_PREFIX = "";

// แปลงวันที่ไทยเป็น ISO (เช่น "10 มิ.ย. 2567" เป็น "2024-06-10")
function parseThaiDateToISO(thaiDateStr: string): string {
  if (!thaiDateStr) return new Date().toISOString().split("T")[0];
  const cleanStr = thaiDateStr.trim().replace(/\s+/g, " ");
  const parts = cleanStr.split(" ");
  if (parts.length < 3) {
    return new Date().toISOString().split("T")[0];
  }
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1];
  const year = parseInt(parts[2], 10) - 543;

  const shortMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const fullMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  let monthIdx = shortMonths.indexOf(monthStr);
  if (monthIdx === -1) {
    monthIdx = fullMonths.indexOf(monthStr);
  }
  if (monthIdx === -1) {
    monthIdx = 0;
  }

  const m = String(monthIdx + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// แปลงวันที่ ISO เป็นภาษาไทย
function formatISOToThaiFull(isoStr: string): string {
  if (!isoStr) return "";
  const parts = isoStr.split("-");
  if (parts.length !== 3) return isoStr;
  const y = parseInt(parts[0], 10) + 543;
  const mIdx = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const fullMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  return `${d} ${fullMonths[mIdx]} ${y}`;
}

// แปลงรูปแบบเวลา (เช่น "08.30 น." เป็น ["08", "30"])
function parseTime(timeStr: string): [string, string] {
  if (!timeStr) return ["08", "30"];
  const clean = timeStr.replace(" น.", "").replace(".", ":").trim();
  const parts = clean.split(":");
  if (parts.length === 2) {
    return [parts[0].padStart(2, "0"), parts[1].padStart(2, "0")];
  }
  return ["08", "30"];
}

export default function TravelPermissionModal({
  isOpen,
  onClose,
  onExport,
  initialData,
  submitLabel = "บันทึก",
  readOnly = false,
}: Props) {
  const [formData, setFormData] = useState<TravelPermissionData>(mockTravelData);

  // จัดการ Reset ข้อมูลเมื่อ Modal เปิด หรือมีการเปลี่ยน Initial Data
  useEffect(() => {
    if (isOpen) {
      const baseData = initialData || mockTravelData;
      setFormData(baseData);

      // ปรับจูนค่า Date Picker และ Time ให้ตรงกับข้อมูลที่ส่งมา
      setDepDateISO(parseThaiDateToISO(baseData.departureDate));
      setRetDateISO(parseThaiDateToISO(baseData.returnDate));

      const [h, m] = parseTime(baseData.departureTime);
      setDepHour(h);
      setDepMinute(m);

      setCompanionName("");
      setCompanionPosition("");
    }
  }, [isOpen, initialData]);

  const [companionName, setCompanionName] = useState("");
  const [companionPosition, setCompanionPosition] = useState("");

  const [depDateISO, setDepDateISO] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [depHour, setDepHour] = useState(() => {
    return String(new Date().getHours()).padStart(2, "0");
  });
  const [depMinute, setDepMinute] = useState(() => {
    return String(new Date().getMinutes()).padStart(2, "0");
  });
  const [retDateISO, setRetDateISO] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const suffix = e.target.value;
    const newValue = DOCUMENT_NO_PREFIX + suffix;
    setFormData((prev) => ({ ...prev, documentNo: newValue }));
  };

  const handleAddCompanion = () => {
    if (!companionName.trim() || !companionPosition.trim()) return;
    if ((formData.companions || []).length >= 7) {
      alert("ผู้ร่วมเดินทางต้องไม่เกิน 7 คน");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      companions: [
        ...(prev.companions || []),
        { name: companionName.trim(), position: companionPosition.trim() },
      ],
    }));
    setCompanionName("");
    setCompanionPosition("");
  };

  const handleRemoveCompanion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      companions: (prev.companions || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      departureDate: formatISOToThaiFull(depDateISO),
      departureTime: `${depHour}.${depMinute} น.`,
      returnDate: formatISOToThaiFull(retDateISO),
    };
    onExport(updatedData);
    onClose();
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition";
  const labelClass = "text-sm font-medium text-slate-700 mb-1.5 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              ข้อมูลขออนุญาตไปราชการ
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              กรอกรายละเอียดเพื่อสร้างรายงาน ชป.384
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition text-slate-400"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold">
                1
              </span>
              ข้อมูลพื้นฐาน
            </h3>
            <fieldset disabled={readOnly} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelClass}>เลขที่หนังสือ</label>
                  <input
                    name="documentNo"
                    value={
                      formData.documentNo.startsWith(DOCUMENT_NO_PREFIX)
                        ? formData.documentNo.slice(DOCUMENT_NO_PREFIX.length)
                        : ""
                    }
                    onChange={handleDocumentNoChange}
                    className={inputClass}
                    placeholder="ระบุเลขที่หนังสือ เช่น 94/2568"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>เรื่อง</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>เรียน (ตำแหน่ง)</label>
                  <input
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-1 flex gap-2">
                  <div className="w-24 shrink-0">
                    <label className={labelClass}>คำนำหน้า</label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {TITLE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>ชื่อ-นามสกุล ผู้ขอ</label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="ไม่ต้องพิมพ์คำนำหน้า"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>ตำแหน่ง</label>
                  <input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-1 flex gap-2">
                  <div className="w-32 shrink-0">
                    <label className={labelClass}>ประเภทสังกัด</label>
                    <select
                      name="departmentType"
                      value={formData.departmentType}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {DEPT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>ชื่อหน่วยงานสังกัด</label>
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold">
                2
              </span>
              รายละเอียดการเดินทาง
            </h3>
            <fieldset disabled={readOnly} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <label className={labelClass}>สถานที่ไปราชการ</label>
                  <input
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>จังหวัด</label>
                  <input
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>วัตถุประสงค์</label>
                  <textarea
                    name="objective"
                    value={formData.objective}
                    onChange={handleChange}
                    className={`${inputClass} h-24 resize-none`}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>ตามคำสั่งของ</label>
                  <input
                    name="orderedBy"
                    value={formData.orderedBy}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="เช่น ผบท.ชป.4"
                  />
                </div>
                <div>
                  <label className={labelClass}>วันที่ไป</label>
                  <ThaiDatePicker
                    value={depDateISO}
                    onChange={(val) => setDepDateISO(val)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className={labelClass}>เวลา</label>
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={depHour}
                      onChange={(e) => setDepHour(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:bg-white transition w-20 outline-none"
                    >
                      {Array.from({ length: 24 }).map((_, i) => {
                        const h = String(i).padStart(2, "0");
                        return <option key={h} value={h}>{h}</option>;
                      })}
                    </select>
                    <span className="text-slate-500 font-bold">:</span>
                    <select
                      value={depMinute}
                      onChange={(e) => setDepMinute(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:bg-white transition w-20 outline-none"
                    >
                      {Array.from({ length: 60 }).map((_, i) => {
                        const m = String(i).padStart(2, "0");
                        return <option key={m} value={m}>{m}</option>;
                      })}
                    </select>
                    <span className="text-sm text-slate-500">น.</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>วันที่กลับ</label>
                  <ThaiDatePicker
                    value={retDateISO}
                    onChange={(val) => setRetDateISO(val)}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className={labelClass}>รวมจำนวนวัน</label>
                  <input
                    name="totalDays"
                    value={formData.totalDays}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>เลขทะเบียนรถ</label>
                  <input
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </fieldset>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold">
                3
              </span>
              ผู้ร่วมเดินทางไปด้วย
            </h3>
            {!readOnly && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-end mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <label className={labelClass}>ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 transition"
                    placeholder="ระบุชื่อ-นามสกุล เช่น นางสาวสมหญิง รักงาน"
                  />
                </div>
                <div>
                  <label className={labelClass}>ตำแหน่ง</label>
                  <input
                    type="text"
                    value={companionPosition}
                    onChange={(e) => setCompanionPosition(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 transition"
                    placeholder="ระบุตำแหน่ง เช่น นายช่างชลประทาน"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddCompanion}
                    disabled={(formData.companions || []).length >= 7}
                    className="w-full rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {(formData.companions || []).length >= 7 ? "เต็ม 7 คนแล้ว" : "+ เพิ่มคน"}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-medium">
                    <th className="px-4 py-3 w-16">ลำดับ</th>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3">ตำแหน่ง</th>
                    <th className="px-4 py-3 w-20 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700">
                  {formData.companions && formData.companions.length > 0 ? (
                    formData.companions.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{comp.name}</td>
                        <td className="px-4 py-3">{comp.position}</td>
                        <td className="px-4 py-3 text-center">
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCompanion(idx)}
                              className="text-red-500 hover:text-red-700 font-semibold px-2 py-1 hover:bg-red-50 rounded transition"
                            >
                              ลบ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                        ยังไม่มีผู้ร่วมเดินทาง
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold">
                4
              </span>
              ผู้ปฏิบัติหน้าที่แทน
            </h3>
            <fieldset disabled={readOnly} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>ชื่อผู้ปฏิบัติหน้าที่แทน</label>
                  <input
                    name="replacementName"
                    value={formData.replacementName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>ตำแหน่ง</label>
                  <input
                    name="replacementPosition"
                    value={formData.replacementPosition}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </fieldset>
          </section>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            {submitLabel && (
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                {submitLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
