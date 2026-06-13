"use client";

import { useEffect, useState } from "react";
import AppSidebar from "@/app/components/AppSidebar";
import Card from "@/app/components/Card";
import Header from "@/app/components/Header";
import KpiCard from "@/app/components/KpiCard";
import YearSelector from "@/app/components/YearSelector";
import NewsLineChart from "@/app/components/charts/NewsLineChart";
import TravelBarChart from "@/app/components/charts/TravelBarChart";
import VehicleAreaChart from "@/app/components/charts/VehicleAreaChart";
import ExpensePieChart from "@/app/components/charts/ExpensePieChart";

import {
    DocumentTextIcon,
    BriefcaseIcon,
    TruckIcon,
    BanknotesIcon,
} from "@heroicons/react/24/outline";

import {
    Newspaper,
    Plane,
    Car,
    Wallet,
} from "lucide-react";


export default function DashboardPage() {
    const [collapsed, setCollapsed] = useState(false);

    const [year, setYear] =
        useState(2569);

    const [data, setData] =
        useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [year]);

    const fetchData =
        async () => {
            const res = await fetch(
                `/api/dashboard?year=${year}`
            );

            setData(await res.json());
        };

    if (!data)
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-center">

                    <div className="mx-auto mb-6 h-20 w-20">
                        <div className="h-full w-full animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-700">
                        กำลังโหลดข้อมูล
                    </h2>

                    <p className="mt-2 text-slate-500">
                        กรุณารอสักครู่...
                    </p>

                </div>
            </div>
        );

    return (
        <div className="flex">

            <div
                className={`
        transition-all
        duration-500

        ${collapsed
                        ? "w-20"
                        : "w-64"
                    }
    `}
            >
                <AppSidebar
                    collapsed={collapsed}
                />
            </div>

            {/* 🔹 Main */}
            <div className="flex-1 min-w-0 bg-gray-100 min-h-screen">

                {/* 🔹 Header */}
                <Header toggle={() => setCollapsed(!collapsed)} />

                {/* 🔹 Content */}
                <div className="p-6 space-y-6">

                    {/* 🔹 Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card
                            title="รายงานข่าว"
                            value={data.summary.news.toLocaleString()}
                            icon={<DocumentTextIcon className="w-10 h-10" />}
                        />
                        <Card
                            title="ไปราชการ(ชป.318)"
                            value={data.summary.travel.toLocaleString()}
                            icon={<BriefcaseIcon className="w-10 h-10" />}
                        />
                        <Card
                            title="ขอใช้ยานพาหนะส่วนกลาง(แบบ3)"
                            value={data.summary.vehicle.toLocaleString()}
                            icon={<TruckIcon className="w-10 h-10" />}
                        />
                        <Card
                            title="ค่าใช้จ่าย(ห้องปท.ชป.4)"
                            value={data.summary.expense.toLocaleString()}
                            icon={<BanknotesIcon className="w-10 h-10" />}
                        />
                    </div>

                    <YearSelector
                        years={data.availableYears}
                        value={year}
                        onChange={setYear}
                    />

                    <div className="grid lg:grid-cols-2 gap-6 min-w-0">
                        <div className="bg-white
  p-6
  rounded-2xl
  shadow
  min-w-0
  overflow-hidden">
                            <h2 className="font-bold mb-4">
                                แนวโน้มข่าว
                            </h2>

                            <NewsLineChart
                                data={data.newsChart}
                            />
                        </div>

                        <div className="bg-white
  p-6
  rounded-2xl
  shadow
  min-w-0
  overflow-hidden">
                            <h2 className="font-bold mb-4">
                                ไปราชการ
                            </h2>

                            <TravelBarChart
                                data={
                                    data.travelChart
                                }
                            />
                        </div>

                        <div className="bg-white
  p-6
  rounded-2xl
  shadow
  min-w-0
  overflow-hidden">
                            <h2 className="font-bold mb-4">
                                ขอใช้รถ
                            </h2>

                            <VehicleAreaChart
                                data={
                                    data.vehicleChart
                                }
                            />
                        </div>

                        <div className="bg-white
  p-6
  rounded-2xl
  shadow
  min-w-0
  overflow-hidden">
                            <h2 className="font-bold mb-4">
                                ค่าใช้จ่าย
                            </h2>
                            <ExpensePieChart
                                data={
                                    data.expenseChart
                                }
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
