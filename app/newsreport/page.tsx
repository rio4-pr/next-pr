"use client";

import ThaiDatePicker from "@/app/components/ThaiDatePicker";

import { useState, useMemo } from "react";

import * as XLSX from "xlsx-js-style";

import AppSidebar from "@/app/components/AppSidebar";

import Header from "@/app/components/Header";

import TimePicker24 from "@/app/components/TimePicker24";
import ExportButtons from "@/app/components/ExportButtons";

import SearchBox from "@/app/components/SearchBox";
import { exportPdf } from "@/app/components/ExportPDF";

import {
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type ReportRow = {
  id: number;

  date: string;

  title: string;

  source: string;

  category: NewsCategory;
};

type NewsCategory =
  | "royal-project"
  | "water-development"
  | "water-management"
  | "organization";
const detectNewsCategory = (title: string): NewsCategory => {
  const text = title.trim();

  if (
    text.includes("พระราชดำริ") ||
    text.includes("โครงการหลวง") ||
    text.includes("หลวง")
  ) {
    return "royal-project";
  }

  if (
    text.includes("น้ำท่วม") ||
    text.includes("ภัยแล้ง") ||
    text.includes("ภัย") ||
    text.includes("ระบายน้ำ") ||
    text.includes("บริหารจัดการน้ำ") ||
    text.includes("ฝนตก")
  ) {
    return "water-management";
  }

  if (
    text.includes("อ่างเก็บน้ำ") ||
    text.includes("คลอง") ||
    text.includes("ชลประทาน") ||
    text.includes("พัฒนาแหล่งน้ำ") ||
    text.includes("พัฒนา") ||
    text.includes("ขุดลอก")
  ) {
    return "water-development";
  }

  return "organization";
};

const initialRows: ReportRow[] = [
  {
    id: 1,

    date: "21 พ.ค. 2567 09:30",

    title: "สถานการณ์ฝนตกชุกในพื้นที่",

    source: "กองอำนวยการ",

    category: "organization",
  },

  {
    id: 2,

    date: "21 พ.ค. 2567 09:15",

    title: "การประชุมเตรียมพร้อมน้ำท่วม",

    source: "กองแผนงาน",

    category: "water-management",
  },

  {
    id: 3,

    date: "20 พ.ค. 2567 17:45",

    title: "มอบหมายงานจัดสถานที่",

    source: "ศูนย์ฯ ชป.4",

    category: "organization",
  },

  {
    id: 4,

    date: "20 พ.ค. 2567 14:20",

    title: "สำรวจปริมาณน้ำในเขื่อน",

    source: "สนง.ชลประทาน",

    category: "water-development",
  },

  {
    id: 5,

    date: "20 พ.ค. 2567 10:10",

    title: "แผนการจัดส่งรถปฏิบัติการ",

    source: "ศูนย์ปฏิบัติการ",

    category: "royal-project",
  },
];

const exportColumns: { key: keyof ReportRow; label: string; width?: number }[] =
  [
    { key: "id", label: "ลำดับ", width: 10 },

    { key: "date", label: "วันที่/เวลา", width: 22 },

    { key: "title", label: "หัวข้อข่าว", width: 42 },

    { key: "source", label: "แหล่งข่าว", width: 24 },
  ];

const summaryCategoryLabels: { key: NewsCategory; label: string }[] = [
  { key: "royal-project", label: "โครงการอันเนื่องมาจากพระราชดำริ" },

  {
    key: "water-development",

    label: "ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน",
  },

  {
    key: "water-management",

    label: "ด้านบริหารจัดการน้ำบรรเทาภัยอันเกิดจากน้ำ",
  },

  { key: "organization", label: "ด้านการสร้างภาพลักษณ์องค์กร และอื่นๆ" },
];

const officeOptions = [
  "สชป.4",

  "คป.สุโขทัย",

  "คป.ตาก",

  "คป.กำแพงเพชร",

  "คป.แพร่",

  "คบ.สุโขทัย",

  "คบ.แม่ยม",

  "คบ.ท่อทองแดง",

  "คบ.วังบัว",

  "คบ.วังยาง",

  "คส.4",
];

const thaiMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",

  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const formatThaiDate = (isoDate: string, time: string): string => {
  // isoDate expected as "YYYY-MM-DD" (Gregorian) from ThaiDatePicker

  const parts = isoDate.split("-");

  if (parts.length !== 3) return `${isoDate} ${time}`;

  const year = parseInt(parts[0], 10);

  const month = parseInt(parts[1], 10);

  const day = parseInt(parts[2], 10);

  const buddhistYear = year + 543;

  const monthLabel = thaiMonths[month - 1] ?? "";

  return `${day} ${monthLabel} ${buddhistYear} ${time}`;
};

const buildWebSummaryRows = (targetRows: ReportRow[]) => {
  const officeMap = new Map<
    string,
    {
      office: string;

      "royal-project": number;

      "water-development": number;

      "water-management": number;

      organization: number;

      total: number;
    }
  >();

  targetRows.forEach((row) => {
    if (!officeMap.has(row.source)) {
      officeMap.set(row.source, {
        office: row.source,

        "royal-project": 0,

        "water-development": 0,

        "water-management": 0,

        organization: 0,

        total: 0,
      });
    }

    const targetOffice = officeMap.get(row.source);

    if (!targetOffice) return;

    targetOffice[row.category as NewsCategory] += 1;

    targetOffice.total += 1;
  });

  const summaryRows = Array.from(officeMap.values()).sort((a, b) =>
    a.office.localeCompare(b.office, "th"),
  );

  const totals = summaryRows.reduce(
    (acc, item) => ({
      "royal-project": acc["royal-project"] + item["royal-project"],

      "water-development": acc["water-development"] + item["water-development"],

      "water-management": acc["water-management"] + item["water-management"],

      organization: acc.organization + item.organization,

      total: acc.total + item.total,
    }),

    {
      "royal-project": 0,

      "water-development": 0,

      "water-management": 0,

      organization: 0,

      total: 0,
    },
  );

  return { rows: summaryRows, totals };
};

const getCurrentTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};

const getTodayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const categoryLabelMap: Record<NewsCategory, string> = {
  "royal-project": "โครงการอันเนื่องมาจากพระราชดำริ",

  "water-development": "ด้านพัฒนาแหล่งน้ำ",

  "water-management": "ด้านบริหารจัดการน้ำ",

  organization: "ภาพลักษณ์องค์กร",
};

export default function NewsReportPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [collapsed, setCollapsed] = useState(false);

  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  const [newsRows, setNewsRows] = useState<ReportRow[]>(initialRows);

  const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);

  const [newNewsForm, setNewNewsForm] = useState({
    reportDate: getTodayISO(), // 👈 auto วันนี้
    reportTime: getCurrentTime(),
    title: "",
    source: "",
    category: "organization" as NewsCategory,
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const resetNewsForm = () => {
    setNewNewsForm({
      reportDate: getTodayISO(),
      reportTime: getCurrentTime(),
      title: "",
      source: "",
      category: "organization",
    });
  };

  const displayedRows = useMemo(() => {
    return [...newsRows]
      .filter((row) => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return true;

        const categoryText =
          categoryLabelMap[row.category as NewsCategory]?.toLowerCase() || "";

        return (
          row.title.toLowerCase().includes(keyword) ||
          row.source.toLowerCase().includes(keyword) ||
          categoryText.includes(keyword)
        );
      })
      .sort((a, b) => {
        if (sortOrder === "asc") return a.id - b.id;
        return b.id - a.id;
      });
  }, [newsRows, searchTerm, sortOrder]);

  // Shared summary for both UI and Export
  const summary = useMemo(
    () => buildWebSummaryRows(displayedRows),
    [displayedRows]
  );

  const handleCreateNews = () => {
    if (
      !newNewsForm.reportDate ||
      !newNewsForm.reportTime ||
      !newNewsForm.title ||
      !newNewsForm.source
    )
      return;

    const nextId =
      newsRows.length > 0 ? Math.max(...newsRows.map((row) => row.id)) + 1 : 1;

    // FIX #3: Use Thai Buddhist Era formatted date consistent with existing rows

    const formattedDate = formatThaiDate(
      newNewsForm.reportDate,

      newNewsForm.reportTime,
    );

    const payload: ReportRow = {
      id: nextId,

      date: formattedDate,

      title: newNewsForm.title,

      source: newNewsForm.source,

      category: newNewsForm.category,
    };

    setNewsRows((prev) => [payload, ...prev]);

    setIsCreateNewsModalOpen(false);
  };

  const exportToExcel = () => { // ฟังก์ชันนี้ยังคงอยู่ใน NewsReportPage
    const selectedExcelRows = displayedRows; // กำหนดค่าใน scope นี้
    const selectedExcelDatasetLabel = "ทั้งหมด"; // กำหนดค่าใน scope นี้
    const workbook = XLSX.utils.book_new();

    const headerRow = exportColumns.map((column) => column.label);

    const bodyRows = selectedExcelRows.map((row) =>
      exportColumns.map((column) => row[column.key]),
    );

    const summaryHeader = [
      "ลำดับ",

      "หน่วยงาน",

      ...summaryCategoryLabels.map((item) => item.label),

      "รวมทั้งหมด",
    ];

    const worksheetData: (string | number)[][] = [
      [`รายงานข่าวสำนักงานชลประทานที่ 4 (${selectedExcelDatasetLabel})`],

      [`พิมพ์เมื่อ ${new Date().toLocaleString("th-TH")}`],

      [],

      summaryHeader,

      ...summary.rows.map((item, index) => [
        index + 1,

        item.office,

        item["royal-project"] > 0 ? item["royal-project"] : "-",

        item["water-development"] > 0 ? item["water-development"] : "-",

        item["water-management"] > 0 ? item["water-management"] : "-",

        item.organization > 0 ? item.organization : "-",

        item.total > 0 ? item.total : "-",
      ]),

      [
        "รวมทั้งหมด",

        "",

        summary.totals["royal-project"] > 0
          ? summary.totals["royal-project"]
          : "-",

        summary.totals["water-development"] > 0
          ? summary.totals["water-development"]
          : "-",

        summary.totals["water-management"] > 0
          ? summary.totals["water-management"]
          : "-",

        summary.totals.organization > 0
          ? summary.totals.organization
          : "-",

        summary.totals.total,
      ],

      [],

      ["ลำดับ", ...headerRow],

      ...bodyRows.map((row) => [row[0], ...row]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet["!cols"] = [
      { wch: 8 },

      { wch: 22 },

      { wch: 18 },

      { wch: 18 },

      { wch: 18 },

      { wch: 20 },

      { wch: 12 },

      { wch: 8 },

      { wch: 21 },

      { wch: 44 },

      { wch: 20 },

      { wch: 16 },

      { wch: 16 },
    ];

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },

      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },

      {
        s: { r: summary.rows.length + 4, c: 0 },

        e: { r: summary.rows.length + 4, c: 1 },
      },
    ];

    const allBorder = {
      top: { style: "thin", color: { rgb: "334155" } },

      bottom: { style: "thin", color: { rgb: "334155" } },

      left: { style: "thin", color: { rgb: "334155" } },

      right: { style: "thin", color: { rgb: "334155" } },
    };

    const headerFill = { fgColor: { rgb: "4F83D1" } };

    const titleFill = { fgColor: { rgb: "DBEAFE" } };

    const summaryFill = { fgColor: { rgb: "EFF6FF" } };

    const applyStyle = (
      r: number,

      c: number,

      style: Record<string, unknown>,
    ) => {
      const ref = XLSX.utils.encode_cell({ r, c });

      if (!worksheet[ref]) return;

      worksheet[ref].s = {
        ...(worksheet[ref].s || {}),

        ...style,
      };
    };

    applyStyle(0, 0, {
      font: { bold: true, sz: 18, color: { rgb: "1E3A8A" } },

      alignment: { horizontal: "left", vertical: "center" },

      fill: titleFill,
    });

    applyStyle(1, 0, {
      font: { bold: true, sz: 11, color: { rgb: "475569" } },

      alignment: { horizontal: "left", vertical: "center" },

      fill: titleFill,
    });

    for (let col = 0; col <= 12; col += 1) {
      applyStyle(3, col, {
        font: { bold: true, color: { rgb: "FFFFFF" } },

        alignment: { horizontal: "center", vertical: "center", wrapText: true },

        fill: headerFill,

        border: allBorder,
      });
    }

    const newsHeaderRowIndex = summary.rows.length + 6;

    for (let col = 0; col <= 6; col += 1) {
      applyStyle(newsHeaderRowIndex, col, {
        font: { bold: true, color: { rgb: "FFFFFF" } },

        alignment: { horizontal: "center", vertical: "center", wrapText: true },

        fill: headerFill,

        border: allBorder,
      });
    }

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

    for (let row = 4; row <= range.e.r; row += 1) {
      for (let col = 0; col <= 12; col += 1) {
        if (row === newsHeaderRowIndex) continue;

        applyStyle(row, col, {
          border: allBorder,

          alignment: {
            vertical: "center",

            horizontal: col === 9 ? "left" : "center",

            wrapText: col === 9,
          },

          fill:
            col <= 6
              ? summaryFill
              : { fgColor: { rgb: row % 2 === 0 ? "FFFFFF" : "F8FAFC" } },
        });
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานข่าว");

    XLSX.writeFile(workbook, "news_report.xlsx");
  };

  const handleExportPdf = async () => {
    await exportPdf({
      title: "รายงานสรุปข่าวสาร ประจำเดือนพฤษภาคม 2567",
      summaryRows: summary.rows,
      summaryTotals: summary.totals,
      newsRows: displayedRows,
    }, "news_report.pdf");
  };

  const reportSummary = [
    {
      label: "ข่าวทั้งหมด",

      value: newsRows.length,

      icon: <ArrowDownTrayIcon className="w-6 h-6" />,
    },

    {
      label: "ด้านบริหารจัดการน้ำ",

      value: newsRows.filter((i) => i.category === "water-management").length,

      icon: <CalendarIcon className="w-6 h-6" />,
    },

    {
      label: "ด้านพัฒนาแหล่งน้ำ",

      value: newsRows.filter((i) => i.category === "water-development").length,

      icon: <FunnelIcon className="w-6 h-6" />,
    },

    {
      label: "ภาพลักษณ์องค์กร",

      value: newsRows.filter((i) => i.category === "organization").length,

      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
    },
  ];

  return (

    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="newsreport" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header
          toggle={() => setCollapsed(!collapsed)}
          title="สรุปรายงานข่าว"
        />

        <div id="pdf-content" className="p-6 space-y-6 bg-white" style={{ backgroundColor: '#fff' }}>
          
          {/* Section Header & Summary */}
          <div className="bg-white p-6 rounded-3xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold mt-2">สรุปรายงานข่าว</h1>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                  <CalendarIcon className="w-4 h-4" />
                  01/05/2567 - 21/05/2567
                </div>

                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 transition">
                  <FunnelIcon className="w-4 h-4" />
                  กรองข้อมูล
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6 xl:grid-cols-4">
              {reportSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>

                    <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    {item.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    ค้นหา
                  </span>
                  <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="ค้นหาชื่อข่าว, หัวข้อข่าว, แหล่งข่าว..."
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    ช่วงวันที่
                  </span>

                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    01/05/2567 - 21/05/2567
                  </div>
                </label>
              </div>

              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition">
                <MagnifyingGlassIcon className="w-5 h-5" />
                ค้นหา
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">รายการข่าว</h2>

                <p className="text-sm text-slate-500">
                  แสดงข้อมูลข่าวสารล่าสุด
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsCreateNewsModalOpen(true);
                    resetNewsForm();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  + เพิ่มข่าว
                </button>

                <ExportButtons onExportExcel={exportToExcel} onExportPdf={handleExportPdf} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-600">

                  <tr>
                    <th
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "asc" ? "desc" : "asc",
                        )
                      }
                      className="
        px-4 py-3
        text-center align-middle
        font-medium
        whitespace-normal
        cursor-pointer
        select-none
      "
                    >
                      ลำดับ {sortOrder === "asc" ? "▲" : "▼"}
                    </th>

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      วันที่/เวลา
                    </th>

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      หัวข้อข่าว
                    </th>

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      แหล่งข่าว
                    </th>

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {displayedRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4 text-center align-middle">
                        {row.id}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-sm font-medium text-slate-700">
                            {row.date.split(" ").slice(0, 3).join(" ")}
                          </span>

                          <span className="text-xs text-slate-400">
                            {row.date.split(" ").slice(3).join(" ")} น.
                          </span>
                        </div>
                      </td>

                      <td
                        className="px-4 py-4 max-w-xs text-center align-middle truncate"
                        title={row.title}
                      >
                        {row.title}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        {row.source}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <button
                            title="ดูรายละเอียด"
                            className="rounded-full p-2 transition hover:bg-slate-100"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>

                          <button
                            title="แก้ไข"
                            className="rounded-full p-2 transition hover:bg-slate-100"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          <button
                            title="ลบ"
                            className="rounded-full p-2 text-red-500 transition hover:bg-slate-100"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <button
                onClick={() => setIsSummaryCollapsed((prev) => !prev)}
                className="mb-3 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {isSummaryCollapsed
                  ? "แสดงสรุปนับอัตโนมัติ"
                  : "พับสรุปนับอัตโนมัติ"}
              </button>

              {!isSummaryCollapsed && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-3 py-3 text-center font-semibold">
                          ลำดับ
                        </th>

                        <th className="px-3 py-3 text-center font-semibold">
                          หน่วยงาน
                        </th>

                        {summaryCategoryLabels.map((category) => (
                          <th
                            key={category.key}
                            className="px-3 py-3 text-center font-semibold"
                          >
                            {category.label}
                          </th>
                        ))}

                        <th className="px-3 py-3 text-center font-semibold">
                          รวมทั้งหมด
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-slate-700">
                      {summary.rows.map((item, index) => (
                        <tr
                          key={item.office}
                          className="border-t border-slate-300 bg-white"
                        >
                          <td className="px-3 py-3 text-center">{index + 1}</td>

                          <td className="px-3 py-3 text-center font-semibold">
                            {item.office}
                          </td>

                          {summaryCategoryLabels.map((category) => (
                            <td
                              key={category.key}
                              className="px-3 py-3 text-center"
                            >
                              {item[category.key] || "-"}
                            </td>
                          ))}

                          <td className="px-3 py-3 text-center font-semibold">
                            {item.total || "-"}
                          </td>
                        </tr>
                      ))}

                      <tr className="border-t border-slate-300 bg-slate-100 font-semibold">
                        <td className="px-3 py-3 text-center" colSpan={2}>
                          รวมทั้งหมด
                        </td>

                        {summaryCategoryLabels.map((category) => (
                          <td
                            key={category.key}
                            className="px-3 py-3 text-center"
                          >
                          {summary.totals[category.key] || "-"}
                          </td>
                        ))}

                        <td className="px-3 py-3 text-center">
                        {summary.totals.total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {isCreateNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">เพิ่มรายการข่าว</h3>

              <p className="mt-1 text-sm text-slate-500">
                กรอกข้อมูลข่าวเพื่อเพิ่มลงในตารางและสรุปอัตโนมัติ
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  วันที่
                </span>

                <div className="mt-2">
                  <ThaiDatePicker
                    id="reportDate"
                    label=""
                    value={newNewsForm.reportDate}
                    onChange={(value) =>
                      setNewNewsForm((prev) => ({ ...prev, reportDate: value }))
                    }
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">เวลา</span>
                <TimePicker24
                  value={newNewsForm.reportTime}
                  onChange={(time) =>
                    setNewNewsForm((prev) => ({
                      ...prev,
                      reportTime: time,
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  หน่วยงาน
                </span>

                <select
                  value={newNewsForm.source}
                  onChange={(event) =>
                    setNewNewsForm((prev) => ({
                      ...prev,
                      source: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">เลือกหน่วยงาน</option>

                  {officeOptions.map((office) => (
                    <option key={office} value={office}>
                      {office}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  เนื้อหาข่าว
                </span>

                <textarea
                  value={newNewsForm.title}
                  onChange={(event) => {
                    const value = event.target.value;

                    setNewNewsForm((prev) => ({
                      ...prev,

                      title: value,

                      category: detectNewsCategory(value),
                    }));
                  }}
                  placeholder="กรอกเนื้อหาข่าว"
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  หมวดข่าว
                </span>

                <select
                  value={newNewsForm.category}
                  onChange={(event) =>
                    setNewNewsForm((prev) => ({
                      ...prev,

                      category: event.target.value as NewsCategory,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="royal-project">
                    โครงการอันเนื่องมาจากพระราชดำริ
                  </option>

                  <option value="water-development">
                    ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน
                  </option>

                  <option value="water-management">
                    ด้านบริหารจัดการน้ำบรรเทาภัยอันเกิดจากน้ำ
                  </option>

                  <option value="organization">
                    ด้านการสร้างภาพลักษณ์องค์กร และอื่นๆ
                  </option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-3xl">
              <button
                onClick={() => setIsCreateNewsModalOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateNews}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
