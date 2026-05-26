/**
 * app/components/ExportButtons.tsx
 * คอมโพเนนต์สำหรับแสดงปุ่ม Export (Excel) และจัดการ Modal ยืนยันการส่งออก
 */
"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

type ExportButtonsProps = {
  onExportExcel: () => void;
  onExportPdf: () => Promise<void>;
};

export default function ExportButtons({ onExportExcel, onExportPdf }: ExportButtonsProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");

  // เปิด Modal ยืนยันการส่งออก
  const openExportModal = (type: "excel" | "pdf") => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  // จัดการการยืนยันการส่งออก
  const handleConfirmExport = async () => {
    if (exportType === "excel") {
      onExportExcel();
    } else {
      await onExportPdf();
    }
    setIsExportModalOpen(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => openExportModal("excel")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Excel
      </button>

      <button
        onClick={() => openExportModal("pdf")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
        PDF
      </button>

      {/* Export Confirmation Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-2">ยืนยันการส่งออกข้อมูล</h3>
            <p className="text-sm text-slate-500 mb-6">
              คุณต้องการส่งออกข้อมูลสรุปเป็นไฟล์ {exportType === "excel" ? "Excel" : "PDF"} ใช่หรือไม่?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmExport}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}