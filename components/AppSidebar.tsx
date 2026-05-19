import Image from "next/image";

import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/components/Sidebar";

import {
  Cog6ToothIcon,
  HomeIcon,
  MegaphoneIcon,
  Square2StackIcon,
  UserIcon,
  TruckIcon,
  CalculatorIcon,
  ArrowRightStartOnRectangleIcon,
  DocumentTextIcon,
  DocumentIcon,
  BellIcon,
} from "@heroicons/react/20/solid";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarBody>

        {/* 🔹 Logo + Title */}
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="RID Logo"
            width={80}
            height={80}
            className="mx-auto"
          />

          <h1 className="text-sm font-semibold mt-2 leading-tight">
            สำนักงานชลประทานที่ 4
            <br />
            <span className="text-xs opacity-70">
              Regional Irrigation Office 4
            </span>
          </h1>
        </div>

        {/* 🔹 Menu */}
        <SidebarSection>
          <SidebarItem>
            <HomeIcon className="h-5 w-5" />
            <SidebarLabel>Dashboard</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <DocumentIcon className="h-5 w-5" />
            <SidebarLabel>สรุปรายงานข่าว</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <DocumentTextIcon className="h-5 w-5" />
            <SidebarLabel>ไปราชการ</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <TruckIcon className="h-5 w-5" />
            <SidebarLabel>ขอใช้รถ</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <CalculatorIcon className="h-5 w-5" />
            <SidebarLabel>ค่าใช้จ่าย</SidebarLabel>
          </SidebarItem>

          <hr />
          
          <SidebarItem>
            <Cog6ToothIcon className="h-5 w-5" />
            <SidebarLabel>ตั้งค่า</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
            <SidebarLabel>ออกจากระบบ</SidebarLabel>
          </SidebarItem>
        </SidebarSection>

      </SidebarBody>
    </Sidebar>
  );
}