import AppSidebar from "@/components/AppSidebar";
import Chart from "@/components/Chart";
import PieChart from "@/components/PieChart";
import Card from "@/components/Card";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex">

      {/* 🔹 Sidebar */}
      <AppSidebar />

      {/* 🔹 Main */}
      <div className="flex-1 bg-gray-100 min-h-screen">

        {/* 🔹 Header */}
        <Header />

        {/* 🔹 Content */}
        <div className="p-6 space-y-6">

          {/* 🔹 Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card title="ข่าว" value={32} />
            <Card title="ไปราชการ" value={18} />
            <Card title="รถ" value={15} />
            <Card title="ค่าใช้จ่าย" value={24} />
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