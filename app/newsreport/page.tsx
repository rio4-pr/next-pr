"use client";

import { useState } from "react";
import * as XLSX from "xlsx-js-style";
import AppSidebar from "@/app/components/AppSidebar";
import Header from "@/app/components/Header";
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const reportSummary = [
  { label: "ข่าวทั้งหมด", value: 24, icon: <DocumentTextIcon className="w-6 h-6" /> },
  { label: "ข่าววันนี้", value: 12, icon: <CalendarDaysIcon className="w-6 h-6" /> },
  { label: "รอดำเนินการ", value: 8, icon: <ClockIcon className="w-6 h-6" /> },
  { label: "ไม่อนุมัติ", value: 4, icon: <XMarkIcon className="w-6 h-6" /> },
];

const initialRows = [
  {
    id: 1,
    date: "21 พ.ค. 2567 09:30",
    title: "สถานการณ์ฝนตกชุกในพื้นที่",
    source: "กองอำนวยการ",
    category: "organization",
    importance: "ด่วนมาก",
    status: "อนุมัติแล้ว",
  },
  {
    id: 2,
    date: "21 พ.ค. 2567 09:15",
    title: "การประชุมเตรียมพร้อมน้ำท่วม",
    source: "กองแผนงาน",
    category: "water-management",
    importance: "ด่วน",
    status: "อยู่ระหว่างตรวจสอบ",
  },
  {
    id: 3,
    date: "20 พ.ค. 2567 17:45",
    title: "มอบหมายงานจัดสถานที่",
    source: "ศูนย์ฯ ชป.4",
    category: "organization",
    importance: "ปกติ",
    status: "อนุมัติแล้ว",
  },
  {
    id: 4,
    date: "20 พ.ค. 2567 14:20",
    title: "สำรวจปริมาณน้ำในเขื่อน",
    source: "สนง.ชลประทาน",
    category: "water-development",
    importance: "ปกติ",
    status: "รออนุมัติ",
  },
  {
    id: 5,
    date: "20 พ.ค. 2567 10:10",
    title: "แผนการจัดส่งรถปฏิบัติการ",
    source: "ศูนย์ปฏิบัติการ",
    category: "royal-project",
    importance: "ด่วน",
    status: "ไม่อนุมัติ",
  },
];

const badgeStyles: Record<string, string> = {
  "ด่วนมาก": "bg-red-50 text-red-600",
  ด่วน: "bg-orange-50 text-orange-600",
  ปกติ: "bg-emerald-50 text-emerald-600",
  "รออนุมัติ": "bg-yellow-50 text-yellow-600",
};

const statusStyles: Record<string, string> = {
  "อนุมัติแล้ว": "bg-emerald-50 text-emerald-700",
  "อยู่ระหว่างตรวจสอบ": "bg-blue-50 text-blue-700",
  "รออนุมัติ": "bg-yellow-50 text-yellow-700",
  "ไม่อนุมัติ": "bg-red-50 text-red-700",
};

type ReportRow = (typeof initialRows)[number];
type ExcelDatasetKey = "all" | "approved" | "reviewing" | "pending" | "rejected";
type NewsCategory = "royal-project" | "water-development" | "water-management" | "organization";

const exportColumns: { key: keyof ReportRow; label: string; width?: number }[] = [
  { key: "id", label: "ลำดับ", width: 10 },
  { key: "date", label: "วันที่/เวลา", width: 22 },
  { key: "title", label: "หัวข้อข่าว", width: 42 },
  { key: "source", label: "แหล่งข่าว", width: 24 },
  { key: "importance", label: "ระดับความสำคัญ", width: 18 },
  { key: "status", label: "สถานะ", width: 18 },
];

const excelDatasetOptions: { key: ExcelDatasetKey; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "reviewing", label: "อยู่ระหว่างตรวจสอบ" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

const summaryCategoryLabels: { key: NewsCategory; label: string }[] = [
  { key: "royal-project", label: "โครงการอันเนื่องมาจากพระราชดำริ" },
  { key: "water-development", label: "ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน" },
  { key: "water-management", label: "ด้านบริหารจัดการน้ำบรรเทาภัยอันเกิดจากน้ำ" },
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

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getRowsByDataset = (targetRows: ReportRow[], dataset: ExcelDatasetKey) => {
  switch (dataset) {
    case "approved":
      return targetRows.filter((row) => row.status === "อนุมัติแล้ว");
    case "reviewing":
      return targetRows.filter((row) => row.status === "อยู่ระหว่างตรวจสอบ");
    case "pending":
      return targetRows.filter((row) => row.status === "รออนุมัติ");
    case "rejected":
      return targetRows.filter((row) => row.status === "ไม่อนุมัติ");
    default:
      return targetRows;
  }
};

const buildStatusSummaryRows = (targetRows: ReportRow[]) => [
  { label: "อนุมัติแล้ว", value: targetRows.filter((row) => row.status === "อนุมัติแล้ว").length },
  { label: "อยู่ระหว่างตรวจสอบ", value: targetRows.filter((row) => row.status === "อยู่ระหว่างตรวจสอบ").length },
  { label: "รออนุมัติ", value: targetRows.filter((row) => row.status === "รออนุมัติ").length },
  { label: "ไม่อนุมัติ", value: targetRows.filter((row) => row.status === "ไม่อนุมัติ").length },
  { label: "รวมทั้งหมด", value: targetRows.length },
];

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

  const summaryRows = Array.from(officeMap.values()).sort((a, b) => a.office.localeCompare(b.office, "th"));

  const totals = summaryRows.reduce(
    (acc, item) => ({
      "royal-project": acc["royal-project"] + item["royal-project"],
      "water-development": acc["water-development"] + item["water-development"],
      "water-management": acc["water-management"] + item["water-management"],
      organization: acc.organization + item.organization,
      total: acc.total + item.total,
    }),
    { "royal-project": 0, "water-development": 0, "water-management": 0, organization: 0, total: 0 }
  );

  return { rows: summaryRows, totals };
};

const html2canvasUrl = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

const loadHtml2Canvas = async () => {
  if (typeof window === "undefined") return null;
  const currentWindow = window as Window & { html2canvas?: any };
  if (currentWindow.html2canvas) return currentWindow.html2canvas;

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${html2canvasUrl}"]`);
  if (existingScript) {
    return new Promise<any>((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(currentWindow.html2canvas));
      existingScript.addEventListener("error", () => reject(new Error("Failed to load html2canvas bundle")));
    });
  }

  return new Promise<any>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = html2canvasUrl;
    script.async = true;
    script.onload = () => resolve(currentWindow.html2canvas);
    script.onerror = () => reject(new Error("Failed to load html2canvas script"));
    document.body.appendChild(script);
  });
};

export default function NewsReportPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf">("excel");
  const [selectedExcelDataset, setSelectedExcelDataset] = useState<ExcelDatasetKey>("all");
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [newsRows, setNewsRows] = useState<ReportRow[]>(initialRows);
  const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);
  const [newNewsForm, setNewNewsForm] = useState({
    reportDate: "",
    reportTime: "",
    title: "",
    source: "",
    category: "organization" as NewsCategory,
    importance: "ปกติ",
  });

  const displayedRows = newsRows;
  const selectedExcelRows = getRowsByDataset(newsRows, selectedExcelDataset);
  const webSummary = buildWebSummaryRows(displayedRows);
  const exportSummary = buildWebSummaryRows(selectedExcelRows);
  const selectedExcelDatasetLabel =
    excelDatasetOptions.find((option) => option.key === selectedExcelDataset)?.label ?? "ทั้งหมด";

  const openExportModal = (type: "excel" | "pdf") => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const handleCreateNews = () => {
    if (!newNewsForm.reportDate || !newNewsForm.reportTime || !newNewsForm.title || !newNewsForm.source) return;
    const nextId = newsRows.length > 0 ? Math.max(...newsRows.map((row) => row.id)) + 1 : 1;
    const [year, month, day] = newNewsForm.reportDate.split("-");
    const formattedDate = `${Number(day)}/${Number(month)}/${year} ${newNewsForm.reportTime}`;
    const payload: ReportRow = {
      id: nextId,
      date: formattedDate,
      title: newNewsForm.title,
      source: newNewsForm.source,
      category: newNewsForm.category,
      importance: newNewsForm.importance,
      status: "รออนุมัติ",
    };
    setNewsRows((prev) => [payload, ...prev]);
    setNewNewsForm({
      reportDate: "",
      reportTime: "",
      title: "",
      source: "",
      category: "organization",
      importance: "ปกติ",
    });
    setIsCreateNewsModalOpen(false);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const headerRow = exportColumns.map((column) => column.label);
    const bodyRows = selectedExcelRows.map((row) => exportColumns.map((column) => row[column.key]));
    const summaryHeader = ["ลำดับ", "หน่วยงาน", ...summaryCategoryLabels.map((item) => item.label), "รวมทั้งหมด"];
    const worksheetData: (string | number)[][] = [
      [`รายงานข่าวสำนักงานชลประทานที่ 4 (${selectedExcelDatasetLabel})`],
      [`พิมพ์เมื่อ ${new Date().toLocaleString("th-TH")}`],
      [],
      summaryHeader,
      ...exportSummary.rows.map((item, index) => [
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
        exportSummary.totals["royal-project"] > 0 ? exportSummary.totals["royal-project"] : "-",
        exportSummary.totals["water-development"] > 0 ? exportSummary.totals["water-development"] : "-",
        exportSummary.totals["water-management"] > 0 ? exportSummary.totals["water-management"] : "-",
        exportSummary.totals.organization > 0 ? exportSummary.totals.organization : "-",
        exportSummary.totals.total,
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
      { s: { r: exportSummary.rows.length + 4, c: 0 }, e: { r: exportSummary.rows.length + 4, c: 1 } },
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

    const applyStyle = (r: number, c: number, style: Record<string, unknown>) => {
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

    const newsHeaderRowIndex = exportSummary.rows.length + 6;
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
          alignment: { vertical: "center", horizontal: col === 9 ? "left" : "center", wrapText: col === 9 },
          fill: col <= 6 ? summaryFill : { fgColor: { rgb: row % 2 === 0 ? "FFFFFF" : "F8FAFC" } },
        });
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานข่าว");
    XLSX.writeFile(workbook, "news_report.xlsx");
  };

  const exportToPDF = async () => {
    const html2canvas = await loadHtml2Canvas();
    if (!html2canvas) return;

    const { jsPDF } = await import("jspdf");

    const tableHeader = exportColumns.map((column) => `<th>${column.label}</th>`).join("");
    const tableBody = selectedExcelRows
      .map((row) => {
        const cells = exportColumns
          .map((column) => `<td>${escapeHtml(row[column.key])}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    const summaryRows = exportSummary.rows
      .map(
        (item, index) =>
          `<tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.office)}</td>
            <td>${item["royal-project"] || "-"}</td>
            <td>${item["water-development"] || "-"}</td>
            <td>${item["water-management"] || "-"}</td>
            <td>${item.organization || "-"}</td>
            <td>${item.total || "-"}</td>
          </tr>`
      )
      .join("");
    const summaryTotalRow = `<tr>
      <td colspan="2"><strong>รวมทั้งหมด</strong></td>
      <td><strong>${exportSummary.totals["royal-project"] || "-"}</strong></td>
      <td><strong>${exportSummary.totals["water-development"] || "-"}</strong></td>
      <td><strong>${exportSummary.totals["water-management"] || "-"}</strong></td>
      <td><strong>${exportSummary.totals.organization || "-"}</strong></td>
      <td><strong>${exportSummary.totals.total}</strong></td>
    </tr>`;

    const htmlContent = `
      <div class="pdf-export">
        <style>
          * { box-sizing: border-box; }
          .pdf-export { width: 297mm; background: #dbeafe; color: #0f172a; padding: 12px; font-family: Arial, sans-serif; }
          h1 { margin: 0; font-size: 24px; color: #0f3b70; line-height: 1.1; }
          .title-inline { color: #c1121f; }
          .meta { margin: 6px 0 10px; font-size: 12px; color: #1e3a8a; font-weight: 600; }
          .layout { display: grid; grid-template-columns: 100%; gap: 10px; align-items: start; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; background: #fff; }
          th, td { border: 1px solid #334155; padding: 4px; text-align: left; vertical-align: top; }
          thead { background: #4f83d1; color: #fff; }
          .summary-table th, .summary-table td { text-align: center; }
          .main-table td:nth-child(1), .main-table td:nth-child(2) { text-align: center; white-space: nowrap; }
          .main-table td:nth-child(3) { white-space: normal; word-break: break-word; }
          tbody tr:nth-child(even) { background: #eff6ff; }
        </style>
        <h1>รายงานข่าวสำนักงานชลประทานที่ 4 <span class="title-inline">${escapeHtml(selectedExcelDatasetLabel)}</span></h1>
        <p class="meta">พิมพ์เมื่อ: ${new Date().toLocaleString("th-TH")}</p>
        <div class="layout">
          <table class="summary-table">
            <thead><tr><th>ลำดับ</th><th>หน่วยงาน</th><th>โครงการอันเนื่องมาจากพระราชดำริ</th><th>ด้านพัฒนาแหล่งน้ำ</th><th>ด้านบริหารจัดการน้ำ</th><th>ด้านภาพลักษณ์องค์กร</th><th>รวมทั้งหมด</th></tr></thead>
            <tbody>${summaryRows}${summaryTotalRow}</tbody>
          </table>
          <table class="main-table">
            <thead><tr>${tableHeader}</tr></thead>
            <tbody>${tableBody}</tbody>
          </table>
        </div>
      </div>
    `;

    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.left = "-10000px";
    element.style.top = "0";
    element.style.width = "297mm";
    element.style.opacity = "1";
    element.style.pointerEvents = "none";
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, { backgroundColor: "#ffffff", scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imageHeight = pdfWidth / ratio;

      if (imageHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imageHeight);
      } else {
        let position = 0;
        let remainingHeight = imageHeight;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imageHeight);
        remainingHeight -= pdfHeight;
        while (remainingHeight > 0) {
          position = remainingHeight - imageHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imageHeight);
          remainingHeight -= pdfHeight;
        }
      }

      pdf.save("news_report.pdf");
    } finally {
      document.body.removeChild(element);
    }
  };

  const handleConfirmExport = async () => {
    if (exportType === "excel") {
      exportToExcel();
    } else {
      await exportToPDF();
    }
    setIsExportModalOpen(false);
  };

  return (
    <div className="flex">
      <AppSidebar collapsed={collapsed} activePage="newsreport" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header toggle={() => setCollapsed(!collapsed)} title="สรุปรายงานข่าว" />

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
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
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
                  <span className="text-sm font-medium text-slate-700">ค้นหา</span>
                  <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อข่าว, หัวข้อข่าว, แหล่งข่าว..."
                      className="ml-2 w-full bg-transparent text-sm text-slate-800 outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">ช่วงวันที่</span>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    01/05/2567 - 21/05/2567
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">สถานะ</span>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    ทั้งหมด
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
                <p className="text-sm text-slate-500">แสดงข้อมูลข่าวสารล่าสุด</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreateNewsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                >
                  + เพิ่มข่าว
                </button>
                <button
                  onClick={() => openExportModal("excel")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={() => openExportModal("pdf")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 text-left font-medium">ลำดับ</th>
                    <th className="px-4 py-3 text-left font-medium">วันที่/เวลา</th>
                    <th className="px-4 py-3 text-left font-medium">หัวข้อข่าว</th>
                    <th className="px-4 py-3 text-left font-medium">แหล่งข่าว</th>
                    <th className="px-4 py-3 text-left font-medium">ระดับความสำคัญ</th>
                    <th className="px-4 py-3 text-left font-medium">สถานะ</th>
                    <th className="px-4 py-3 text-left font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {displayedRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-4">{row.id}</td>
                      <td className="px-4 py-4">{row.date}</td>
                      <td className="px-4 py-4 max-w-xs truncate">{row.title}</td>
                      <td className="px-4 py-4">{row.source}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badgeStyles[row.importance] || "bg-slate-100 text-slate-700"}`}>
                          {row.importance}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[row.status] || "bg-slate-100 text-slate-700"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <button className="rounded-full p-2 hover:bg-slate-100">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button className="rounded-full p-2 hover:bg-slate-100">
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button className="rounded-full p-2 hover:bg-slate-100 text-red-500">
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
                {isSummaryCollapsed ? "แสดงสรุปนับอัตโนมัติ" : "พับสรุปนับอัตโนมัติ"}
              </button>
              {!isSummaryCollapsed && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-3 py-3 text-center font-semibold">ลำดับ</th>
                        <th className="px-3 py-3 text-center font-semibold">หน่วยงาน</th>
                        {summaryCategoryLabels.map((category) => (
                          <th key={category.key} className="px-3 py-3 text-center font-semibold">
                            {category.label}
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center font-semibold">รวมทั้งหมด</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {webSummary.rows.map((item, index) => (
                        <tr key={item.office} className="border-t border-slate-300 bg-white">
                          <td className="px-3 py-3 text-center">{index + 1}</td>
                          <td className="px-3 py-3 text-center font-semibold">{item.office}</td>
                          {summaryCategoryLabels.map((category) => (
                            <td key={category.key} className="px-3 py-3 text-center">
                              {item[category.key] || "-"}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-center font-semibold">{item.total || "-"}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-300 bg-slate-100 font-semibold">
                        <td className="px-3 py-3 text-center" colSpan={2}>
                          รวมทั้งหมด
                        </td>
                        {summaryCategoryLabels.map((category) => (
                          <td key={category.key} className="px-3 py-3 text-center">
                            {webSummary.totals[category.key] || "-"}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">{webSummary.totals.total}</td>
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
              <p className="mt-1 text-sm text-slate-500">กรอกข้อมูลข่าวเพื่อเพิ่มลงในตารางและสรุปอัตโนมัติ</p>
            </div>
            <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">วันที่</span>
                <input
                  type="date"
                  value={newNewsForm.reportDate}
                  onChange={(event) =>
                    setNewNewsForm((prev) => ({ ...prev, reportDate: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">เวลา</span>
                <input
                  type="time"
                  value={newNewsForm.reportTime}
                  onChange={(event) =>
                    setNewNewsForm((prev) => ({ ...prev, reportTime: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">หน่วยงาน</span>
                <select
                  value={newNewsForm.source}
                  onChange={(event) => setNewNewsForm((prev) => ({ ...prev, source: event.target.value }))}
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
                <span className="text-sm font-medium text-slate-700">หัวข้อข่าว</span>
                <input
                  value={newNewsForm.title}
                  onChange={(event) => setNewNewsForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="กรอกหัวข้อข่าว"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">หมวดข่าว</span>
                <select
                  value={newNewsForm.category}
                  onChange={(event) =>
                    setNewNewsForm((prev) => ({ ...prev, category: event.target.value as NewsCategory }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="royal-project">โครงการอันเนื่องมาจากพระราชดำริ</option>
                  <option value="water-development">ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน</option>
                  <option value="water-management">ด้านบริหารจัดการน้ำบรรเทาภัยอันเกิดจากน้ำ</option>
                  <option value="organization">ด้านการสร้างภาพลักษณ์องค์กร และอื่นๆ</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">ระดับความสำคัญ</span>
                <select
                  value={newNewsForm.importance}
                  onChange={(event) => setNewNewsForm((prev) => ({ ...prev, importance: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="ด่วนมาก">ด่วนมาก</option>
                  <option value="ด่วน">ด่วน</option>
                  <option value="ปกติ">ปกติ</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setIsCreateNewsModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateNews}
                disabled={!newNewsForm.reportDate || !newNewsForm.reportTime || !newNewsForm.source || !newNewsForm.title}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                บันทึกข่าว
              </button>
            </div>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold">
                เลือกข้อมูลสำหรับ Export {exportType === "excel" ? "Excel" : "PDF"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">เลือกชุดข้อมูลที่ต้องการนำออกในไฟล์รายงาน</p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {excelDatasetOptions.map((dataset) => (
                  <label
                    key={dataset.key}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="excel-dataset"
                      checked={selectedExcelDataset === dataset.key}
                      onChange={() => setSelectedExcelDataset(dataset.key)}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{dataset.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmExport}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
