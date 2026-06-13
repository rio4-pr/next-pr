"use client";
import { useState } from "react";
import Link from "next/link";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import TravelSave from "@/app/components/TravelPermissionModal";
import { useRouter } from "next/navigation";
import { TravelPermissionData } from "../travelperm";

export default function CreatePage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const handleSave = (data: TravelPermissionData) => {
    console.log("Saving to request list:", data);
    // ในอนาคตใส่ Logic บันทึกลง Database หรือ State หลักที่นี่
    alert("บันทึกข้อมูลคำขอไปราชการเรียบร้อยแล้ว");
    router.push("/offduty");
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={false} activePage="offduty" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => { }} title="สร้างคำขอไปราชการ" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-3xl shadow p-12 text-center border-2 border-dashed border-slate-300">
            <h2 className="text-xl font-medium text-slate-600 mb-6">คลิกปุ่มด้านล่างเพื่อกรอกข้อมูลคำขอ</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-12 py-5 text-xl font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95"
            >
              <PlusIcon className="w-8 h-8" />
              เปิดแบบฟอร์มบันทึกคำขอ
            </button>
          </div>
        </div>
      </div>

      <TravelSave
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleSave}
      />
    </div>
  );
}
