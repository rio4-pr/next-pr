"use client";
import { useState, useEffect, useCallback } from "react";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { exportTravelPdf, TravelPermissionData } from "./travelperm";
import TravelPermissionModal from "@/app/components/TravelPermissionModal";

interface TravelRequest {
  request_id: number;
  doc_number: string | null;
  purpose: string;
  destination: string;
  depart_date: string;
  return_date: string;
  travel_days: number;
  transport_type: string | null;
  status: string;
  created_at: string;
  travel_participants: {
    participant_id: number;
    role: string;
    users: {
      user_id: number;
      full_name: string;
      position: string;
      department: string;
    };
  }[];
  travel_approvals: {
    approval_id: number;
    approval_step: number;
    status: string;
    users: {
      full_name: string;
      position: string;
    };
  }[];
}

const statusThaiMap: Record<string, string> = {
  approved: "อนุมัติแล้ว",
  submitted: "อยู่ระหว่างตรวจสอบ",
  draft: "รออนุมัติ",
  rejected: "ไม่อนุมัติ",
};

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "อยู่ระหว่างตรวจสอบ": "bg-blue-50 text-blue-700",
  "รออนุมัติ": "bg-yellow-50 text-yellow-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

// แปลง TravelRequest → TravelPermissionData สำหรับ Modal/PDF
function toPermissionData(row: TravelRequest): TravelPermissionData {
  const requester = row.travel_participants.find((p) => p.role === "requester") ?? row.travel_participants[0];
  const companions = row.travel_participants
    .filter((p) => p.role !== "requester")
    .map((p) => ({ name: p.users.full_name, position: p.users.position }));

  const departDate = new Date(row.depart_date);
  const returnDate = new Date(row.return_date);
  const formatThaiDate = (d: Date) =>
    `${d.getDate()} ${["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][d.getMonth()]} ${d.getFullYear() + 543}`;

  const approver = row.travel_approvals?.[0];

  return {
    documentNo: row.doc_number ?? "",
    subject: row.purpose,
    recipient: "อธิบดีกรมชลประทาน",
    title: "นาย",
    fullName: requester?.users.full_name ?? "",
    position: requester?.users.position ?? "",
    department: requester?.users.department ?? "",
    destination: row.destination,
    province: row.destination,
    objective: row.purpose,
    departureDate: formatThaiDate(departDate),
    departureTime: "08:30",
    returnDate: formatThaiDate(returnDate),
    totalDays: String(row.travel_days),
    companions,
    requesterName: requester?.users.full_name ?? "",
    requesterPosition: requester?.users.position ?? "",
    approverName: approver?.users.full_name ?? "",
    approverPosition: approver?.users.position ?? "",
    approveDate: formatThaiDate(new Date()),
  };
}

export default function OffDutyPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [rows, setRows] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitLabel, setModalSubmitLabel] = useState("บันทึก");
  const [selectedItem, setSelectedItem] = useState<TravelPermissionData | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "ทั้งหมด",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.set("keyword", filters.keyword);
      if (filters.status !== "ทั้งหมด") params.set("status", filters.status);

      const res = await fetch(`/api/travel-requests?${params.toString()}`);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data = await res.json();
      setRows(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModalSubmit = (data: TravelPermissionData) => {
    if (modalSubmitLabel === "ยืนยันส่งออก PDF" || modalSubmitLabel === "ส่งออก PDF") {
      exportTravelPdf(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบคำขอนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/travel-requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      setRows((prev) => prev.filter((r) => r.request_id !== id));
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + String(err));
    }
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  // สรุปสถิติจากข้อมูลจริง
  const travelSummary = [
    { label: "คำขอทั้งหมด", value: rows.length, icon: <DocumentTextIcon className="w-6 h-6" /> },
    { label: "อยู่ระหว่างตรวจสอบ", value: rows.filter(r => r.status === "submitted").length, icon: <ClockIcon className="w-6 h-6" /> },
    { label: "อนุมัติแล้ว", value: rows.filter(r => r.status === "approved").length, icon: <CalendarDaysIcon className="w-6 h-6" /> },
    { label: "ไม่อนุมัติ", value: rows.filter(r => r.status === "rejected").length, icon: <BriefcaseIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="offduty" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="ไปราชการ (ชป.318)" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">ไปราชการ</h1>
                <p className="mt-2 text-sm text-slate-500">จัดการคำขอไปราชการและติดตามสถานะ</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsReadOnly(false);
                    setModalSubmitLabel("บันทึก");
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  สร้างคำขอใหม่
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            {travelSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ค้นหา</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาหัวข้อ, ปลายทาง..."
                      value={filters.keyword}
                      onChange={(e) => setFilters(f => ({ ...f, keyword: e.target.value }))}
                      className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">สถานะ</span>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <option>ทั้งหมด</option>
                    <option>อนุมัติแล้ว</option>
                    <option>อยู่ระหว่างตรวจสอบ</option>
                    <option>รออนุมัติ</option>
                    <option>ไม่อนุมัติ</option>
                  </select>
                </label>
              </div>

              <button
                onClick={fetchData}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                ค้นหา
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">รายการคำขอ</h2>
                <p className="text-sm text-slate-500">รวมทั้งหมด {rows.length} รายการ</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => {
                    setModalSubmitLabel("ส่งออก PDF");
                    setIsReadOnly(true);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  PDF (ชป.384)
                </button>
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
                      <th className="px-4 py-3 text-left font-medium">ลำดับ</th>
                      <th className="px-4 py-3 text-left font-medium">เลขที่เอกสาร</th>
                      <th className="px-4 py-3 text-left font-medium">วันที่ไป/กลับ</th>
                      <th className="px-4 py-3 text-left font-medium">ปลายทาง</th>
                      <th className="px-4 py-3 text-left font-medium">เรื่อง</th>
                      <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                      <th className="px-4 py-3 text-center font-medium">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400 italic">
                          ไม่มีข้อมูลคำขอในขณะนี้
                        </td>
                      </tr>
                    )}
                    {rows.map((row, index) => {
                      const statusThai = statusThaiMap[row.status] ?? row.status;
                      return (
                        <tr key={row.request_id}>
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4 font-mono text-xs">{row.doc_number ?? "-"}</td>
                          <td className="px-4 py-4 text-xs whitespace-nowrap">
                            {formatShortDate(row.depart_date)} – {formatShortDate(row.return_date)}
                          </td>
                          <td className="px-4 py-4">{row.destination}</td>
                          <td className="px-4 py-4 max-w-xs">
                            <div className="font-medium text-slate-800 truncate">{row.purpose}</div>
                            <div className="text-xs text-slate-500">{row.travel_days} วัน</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[statusThai] ?? "bg-slate-100 text-slate-700"}`}>
                              {statusThai}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-500">
                              <button
                                onClick={() => {
                                  setSelectedItem(toPermissionData(row));
                                  setIsReadOnly(true);
                                  setModalSubmitLabel("");
                                  setIsModalOpen(true);
                                }}
                                className="rounded-full p-2 hover:bg-blue-50 text-blue-600 transition"
                                title="ดูรายละเอียด"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(toPermissionData(row));
                                  setIsReadOnly(true);
                                  setModalSubmitLabel("ยืนยันส่งออก PDF");
                                  setIsModalOpen(true);
                                }}
                                className="rounded-full p-2 hover:bg-red-50 text-red-600 transition"
                                title="ส่งออก PDF"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(toPermissionData(row));
                                  setIsReadOnly(false);
                                  setModalSubmitLabel("บันทึก");
                                  setIsModalOpen(true);
                                }}
                                className="rounded-full p-2 hover:bg-slate-100 text-amber-600"
                                title="แก้ไข"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(row.request_id)}
                                className="rounded-full p-2 hover:bg-red-50 text-red-500 transition"
                                title="ลบ"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <TravelPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleModalSubmit}
        initialData={selectedItem}
        submitLabel={modalSubmitLabel}
        readOnly={isReadOnly}
      />
    </div>
  );
}
