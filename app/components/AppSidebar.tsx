"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/app/components/Sidebar";
import {
  Cog6ToothIcon,
  HomeIcon,
  TruckIcon,
  CalculatorIcon,
  ArrowRightStartOnRectangleIcon,
  DocumentTextIcon,
  DocumentIcon,
} from "@heroicons/react/20/solid";

export default function AppSidebar({
  collapsed,
  activePage = "dashboard",
}: {
  collapsed: boolean;
  activePage?: string;
}) {
  return (
    <Sidebar collapsed={collapsed}>
      <SidebarBody>
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="RID Logo"
            width={80}
            height={80}
            className="mx-auto"
          />
          {!collapsed && (
            <h1 className="text-sm font-semibold mt-2 leading-tight">
              ฝ่ายประชาสัมพันธ์ฯ สชป.4
              <br />
              <span className="text-xs opacity-70">
               PR Regional Irrigation Office 4
              </span>
            </h1>
          )}
        </div>
        <SidebarSection>
          <Link href="/" className="rounded-lg">
            <SidebarItem active={activePage === "dashboard"} collapsed={collapsed}>
              <HomeIcon className="group h-5 w-5" />
              <SidebarLabel collapsed={collapsed}>Dashboard</SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/newsreport" className="rounded-lg">
            <SidebarItem active={activePage === "newsreport"} collapsed={collapsed}>
              <DocumentIcon className="group h-5 w-5" />
              <SidebarLabel collapsed={collapsed}>สรุปรายงานข่าว(PR)</SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/offduty" className="rounded-lg">
            <SidebarItem active={activePage === "offduty"} collapsed={collapsed}>
              <DocumentTextIcon className="group h-5 w-5" />
              <SidebarLabel collapsed={collapsed}>ไปราชการ(ชป.318)</SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/vehicle" className="rounded-lg">
            <SidebarItem active={activePage === "vehicle"} collapsed={collapsed}>
              <TruckIcon className="group h-5 w-5" />
              <SidebarLabel collapsed={collapsed}>ขอใช้ยานพาหนะ(แบบ 3)</SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/expense" className="rounded-lg">
            <SidebarItem active={activePage === "expense"} collapsed={collapsed}>
              <CalculatorIcon className="group h-5 w-5" />
              <SidebarLabel collapsed={collapsed}>ค่าใช้จ่าย(ห้อง ปท.ชป.4)</SidebarLabel>
            </SidebarItem>
          </Link>

          <hr className="border-blue-400/30 my-3" />

        <SidebarItem collapsed={collapsed}>
          <Cog6ToothIcon className="group h-5 w-5" />
          <SidebarLabel collapsed={collapsed}>ตั้งค่า</SidebarLabel>
        </SidebarItem>

        <SidebarItem collapsed={collapsed}>
          <ArrowRightStartOnRectangleIcon className="group h-5 w-5" />
          <SidebarLabel collapsed={collapsed}>ออกจากระบบ</SidebarLabel>
        </SidebarItem>
      </SidebarSection>

    </SidebarBody>
    </Sidebar >

  );
}
