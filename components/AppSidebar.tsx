"use client";
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

export default function AppSidebar({ collapsed }: { collapsed: boolean }) {
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
          <h1 className="text-sm font-semibold mt-2 leading-tight">
            สำนักงานชลประทานที่ 4
            <br />
            <span className="text-xs opacity-70">
              Regional Irrigation Office 4
            </span>
          </h1>
        </div>
        <SidebarSection>
          <SidebarItem active>
            <HomeIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>Dashboard</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <DocumentIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>สรุปรายงานข่าว(PR)</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <DocumentTextIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>ไปราชการ(ชป.318)</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <TruckIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>ขอใช้ยานพาหนะ(แบบ 3)</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <CalculatorIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>ค่าใช้จ่าย(ห้อง ปท.ชป.4)</SidebarLabel>
          </SidebarItem>

          <hr className="border-blue-400/30 my-3" />

          <SidebarItem>
            <Cog6ToothIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>ตั้งค่า</SidebarLabel>
          </SidebarItem>

          <SidebarItem>
            <ArrowRightStartOnRectangleIcon className="group h-5 w-5" />
            <SidebarLabel collapsed={collapsed}>ออกจากระบบ</SidebarLabel>
          </SidebarItem>
        </SidebarSection>

      </SidebarBody>
    </Sidebar>

  );
}

// import Image from "next/image";
// import {
//   Sidebar,
//   SidebarBody,
//   SidebarItem,
//   SidebarLabel,
//   SidebarSection,
// } from "@/components/Sidebar";
// import {
//   Cog6ToothIcon,
//   HomeIcon,
//   MegaphoneIcon,
//   Square2StackIcon,
//   UserIcon,
//   TruckIcon,
//   CalculatorIcon,
//   ArrowRightStartOnRectangleIcon,
//   DocumentTextIcon,
//   DocumentIcon,
//   BellIcon,
// } from "@heroicons/react/20/solid";

// export default function AppSidebar() {
//   return (
//     <Sidebar>
//       <SidebarBody>

//         {/* 🔹 Logo + Title */}
//         <div className="text-center mb-6">
//           <Image
//             src="/logo.png"
//             alt="RID Logo"
//             width={80}
//             height={80}
//             className="mx-auto"
//           />

//           <h1 className="text-sm font-semibold mt-2 leading-tight">
//             สำนักงานชลประทานที่ 4
//             <br />
//             <span className="text-xs opacity-70">
//               Regional Irrigation Office 4
//             </span>
//           </h1>
//         </div>

//         {/* 🔹 Menu */}
//         <SidebarSection>
//           <SidebarItem active>
//             <HomeIcon className="group h-5 w-5" />
//             <SidebarLabel>Dashboard</SidebarLabel>
//           </SidebarItem>

//           <SidebarItem>
//             <DocumentIcon className="group h-5 w-5" />
//             <SidebarLabel>สรุปรายงานข่าว</SidebarLabel>
//           </SidebarItem>

//           <SidebarItem>
//             <DocumentTextIcon className="group h-5 w-5" />
//             <SidebarLabel>ไปราชการ</SidebarLabel>
//           </SidebarItem>

//           <SidebarItem>
//             <TruckIcon className="group h-5 w-5" />
//             <SidebarLabel>ขอใช้รถ</SidebarLabel>
//           </SidebarItem>

//           <SidebarItem>
//             <CalculatorIcon className="group h-5 w-5" />
//             <SidebarLabel>ค่าใช้จ่าย</SidebarLabel>
//           </SidebarItem>

//           <hr className="border-blue-400/30 my-3" />

//           <SidebarItem>
//             <Cog6ToothIcon className="group h-5 w-5" />
//             <SidebarLabel>ตั้งค่า</SidebarLabel>
//           </SidebarItem>

//           <SidebarItem>
//             <ArrowRightStartOnRectangleIcon className="group h-5 w-5" />
//             <SidebarLabel>ออกจากระบบ</SidebarLabel>
//           </SidebarItem>
//         </SidebarSection>

//       </SidebarBody>
//     </Sidebar>
//   );
// }