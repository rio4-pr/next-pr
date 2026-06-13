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
        <div
          className={`
            text-center
            mb-6

            transition-all
            duration-500
            ease-in-out

            ${collapsed
              ? "px-1"
              : "px-3"
            }
          `}
        >
          <div className="relative flex justify-center">
            <Image
              src="/logo.png"
              alt="RID Logo"
              width={80}
              height={80}
              className={`
    mx-auto

    transition-all
    duration-500
    ease-in-out

    ${collapsed
                  ? "scale-75"
                  : "scale-100"
                }
  `}
            />
          </div>

          <div
            className={`
    overflow-hidden
    transition-all
    duration-500
    ease-in-out

    ${collapsed
                ? "max-h-0 opacity-0"
                : "max-h-24 opacity-100"
              }
  `}
          >
            <h1 className="text-sm font-semibold mt-2 leading-tight">
              ฝ่ายประชาสัมพันธ์ฯ สชป.4
              <br />
              <span className="text-xs opacity-70">
                PR Regional Irrigation Office 4
              </span>
            </h1>
          </div>
        </div>

        <SidebarSection>

          <Link href="/">
            <SidebarItem
              active={
                activePage ===
                "dashboard"
              }
              collapsed={
                collapsed
              }
            >
              <HomeIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

              <SidebarLabel
                collapsed={
                  collapsed
                }
              >
                Dashboard
              </SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/newsreport">
            <SidebarItem
              active={
                activePage ===
                "newsreport"
              }
              collapsed={
                collapsed
              }
            >
              <DocumentIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

              <SidebarLabel
                collapsed={
                  collapsed
                }
              >
                สรุปรายงานข่าว
                (PR)
              </SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/offduty">
            <SidebarItem
              active={
                activePage ===
                "offduty"
              }
              collapsed={
                collapsed
              }
            >
              <DocumentTextIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

              <SidebarLabel
                collapsed={
                  collapsed
                }
              >
                ไปราชการ
                (ชป.318)
              </SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/vehicle">
            <SidebarItem
              active={
                activePage ===
                "vehicle"
              }
              collapsed={
                collapsed
              }
            >
              <TruckIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

              <SidebarLabel
                collapsed={
                  collapsed
                }
              >
                ขอใช้ยานพาหนะ
                (แบบ 3)
              </SidebarLabel>
            </SidebarItem>
          </Link>

          <Link href="/expense">
            <SidebarItem
              active={
                activePage ===
                "expense"
              }
              collapsed={
                collapsed
              }
            >
              <CalculatorIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

              <SidebarLabel
                collapsed={
                  collapsed
                }
              >
                ค่าใช้จ่าย
                (ห้อง ปท.ชป.4)
              </SidebarLabel>
            </SidebarItem>
          </Link>

          <div className="my-4 border-t border-white/20" />

          <SidebarItem
            collapsed={collapsed}
          >
            <Cog6ToothIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />

            <SidebarLabel
              collapsed={collapsed}
            >
              ตั้งค่า
            </SidebarLabel>
          </SidebarItem>

          <SidebarItem
            collapsed={collapsed}
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />

            <SidebarLabel
              collapsed={collapsed}
            >
              ออกจากระบบ
            </SidebarLabel>
          </SidebarItem>

        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}