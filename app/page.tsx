"use client";
import Dashboard from "@/app/dashboard/page";


export default function Home() {

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-100 min-h-screen">
        <Dashboard />
      </div>
    </div>
  );
}
