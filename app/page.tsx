"use client";

import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Chart from "@/components/Chart";
import PieChart from "@/components/PieChart";
import Card from "@/components/Card";
import Header from "@/components/Header";
import {
  DocumentTextIcon,
  BriefcaseIcon,
  TruckIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">

      {/* 🔹 Sidebar */}
       <AppSidebar collapsed={collapsed} />

      {/* 🔹 Main */}
      <div className="flex-1 bg-gray-100 min-h-screen">

        {/* 🔹 Header */}
        <Header toggle={() => setCollapsed(!collapsed)} />

        {/* 🔹 Content */}
        <div className="p-6 space-y-6">

          {/* 🔹 Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card
              title="ข่าว"
              value={32}
              icon={<DocumentTextIcon className="w-10 h-10" />}
            />
            <Card
              title="ไปราชการ"
              value={18}
              icon={<BriefcaseIcon className="w-10 h-10" />}
            />
            <Card
              title="รถ"
              value={15}
              icon={<TruckIcon className="w-10 h-10" />}
            />
            <Card
              title="ค่าใช้จ่าย"
              value={24}
              icon={<BanknotesIcon className="w-10 h-10" />}
            />
          </div>

          {/* 🔹 Charts */}
          <div className="grid grid-cols-3 gap-4">

            {/* 📊 Line Chart */}
            <div className="col-span-2 bg-white p-4 rounded-xl shadow h-80">
              <h2 className="mb-2 font-semibold">สถิติรายวัน</h2>
              <Chart />
            </div>

            {/* 🍩 Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow h-80">
              <h2 className="mb-2 font-semibold">สัดส่วนข้อมูล</h2>
              <PieChart />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}