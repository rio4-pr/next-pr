"use client";

import ThaiDatePicker from "@/app/components/ThaiDatePicker";

import { useState, useMemo, useEffect } from "react";

import * as XLSX from "xlsx-js-style";

import AppSidebar from "@/app/components/AppSidebar";

import Header from "@/app/components/Header";

import ExportButtons from "@/app/components/ExportButtons";

import SearchBox from "@/app/components/SearchBox";
import { exportPdf } from "@/app/components/ExportPDF";

import { classifyNews } from "@/app/utils/newsClassifier";

import NewsForm from '@/app/components/NewsForm';

import { successAlert, errorAlert, confirmDelete, } from "@/lib/swal";
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Define interfaces for better type safety
interface CategoryData {
  category_id: number;
  category_name: string;
  category_code: string; // ROYAL / WATER / AGRI / ENV
}

interface OfficeSummary {
  office: string;
  total: number;
  [key: string]: number | string;
}

interface SummaryCategoryLabel {
  id: number;
  label: string;
  key: string;
}

interface ReportRow {
  id: number;
  date: string;
  title: string;
  content: string;
  source: string;
  sourceId: number;
  categoryId: number;
  link?: string;
  category: string; // ROYAL / WATER / AGRI / ENV
};

interface SortColumn {
  key: string;
  label: string;
}

const detectNewsCategory = (title: string, content: string = ""): string => {
  const result = classifyNews(title.trim(), content.trim());

  if (result.category === "โครงการเนื่องในพระราชดำริ") {
    return "ROYAL";
  } else if (result.category === "ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน") {
    return "WATER";
  } else if (result.category === "ด้านบริหารจัดการน้ำ บรรเทาภัยอันเกิดจากน้ำ") {
    return "AGRI";
  } else {
    return "ENV";
  }
};

const exportColumns: { key: keyof ReportRow; label: string; width?: number }[] =
  [
    { key: "id", label: "ลำดับ", width: 10 },

    { key: "date", label: "วันที่/เวลา", width: 22 },

    { key: "title", label: "หัวข้อข่าว", width: 42 },

    { key: "content", label: "เนื้อหาข่าว", width: 42 },

    { key: "source", label: "แหล่งข่าว", width: 24 },
  ];

const parseThaiDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(0);

  // ISO case
  if (dateStr.includes("T")) return new Date(dateStr);

  // DD/MM/YYYY
  if (dateStr.includes("/")) {
    const parts = dateStr.split(" ")[0].split("/");
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]) - 543;
    return new Date(year, month - 1, day);
  }

  return new Date(dateStr);
};

const buildWebSummaryRows = (
  targetRows: ReportRow[],
  categories: CategoryData[]
) => {
  const officeMap = new Map<string, OfficeSummary>();

  targetRows.forEach((row) => {
    if (!officeMap.has(row.source)) {
      officeMap.set(row.source, {
        office: row.source,
        total: 0,
      });
    }

    const office = officeMap.get(row.source)!;

    const categoryCode = categories.find(
      (c) => c.category_id === row.categoryId
    )?.category_code;

    if (categoryCode) {
      office[categoryCode] = ((office[categoryCode] as number) || 0) + 1;
      office.total++;
    }
  });

  return Array.from(officeMap.values());
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

const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function NewsReportPage() {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStartDateISO, setSelectedStartDateISO] = useState(getTodayISO());
  const [days, setDays] = useState<7 | 15 | 30 | "all">("all");

  const [isHydrated, setIsHydrated] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  // แก้ไข Hydration Mismatch โดยเริ่มที่ [] และโหลดข้อมูลใน useEffect
  const [newsRows, setNewsRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  const [isCreateNewsModalOpen, setIsCreateNewsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // เพิ่ม state สำหรับ View Modal
  const [selectedNews, setSelectedNews] = useState<ReportRow | null>(null); // เก็บข่าวที่เลือก

  const fetchSources = async () => {
    try {
      const res = await fetch(
        "/api/sources"
      );

      const data = await res.json();

      setSources(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      // console.log("Fetched categories:", data);

      setCategories(
        data.map((c: any) => ({
          category_id: c.id,
          category_name: c.label,
          category_code: c.key,
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        await fetchCategories();
        await fetchNews();
        await fetchSources();
      } finally {
        setLoading(false);
      }
    };

    // Set isHydrated to true after the component mounts
    setIsHydrated(true);

    init();
  }, []);

  const [newsForm, setNewsForm] = useState({
    reportDate: "",
    title: "",
    content: "",
    source: "",
    link: "",
    category: "",
  });

  const [sortColumns, setSortColumns] =
    useState<SortColumn[]>([]);

  const [sortColumn, setSortColumn] =
    useState<string>("id");

  const fetchSortColumns = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();

      console.log(data);

      setSortColumns(
        data.sortColumns || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSortColumns();
  }, []);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // ยังคงใช้ state เดิมสำหรับทิศทางการเรียง

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Reset to first page when filtering or sorting changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortColumn, sortOrder, selectedStartDateISO, days]);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();

      // setSortColumns(
      //   data.sortColumns.map((item: any) => ({
      //     key: item.column_name,
      //     label: item.column_label,
      //   }))
      // );

      setNewsRows(data.rows.map((item: any) => { // Explicitly type item as any for raw API response
        const detectedCategoryCode = detectNewsCategory(item.news_title ?? "", item.news_summary ?? "");
        return {
          id: Number(item.news_id),
          date: new Date(item.news_date)
            .toLocaleString("th-TH"),
          title: item.news_title ?? "",
          content: item.news_summary ?? "",
          source:
            item.news_sources?.source_name ?? "-",

          sourceId: item.source_id,
          categoryId: item.category_id,
          link: item.news_url ?? "",
          category: detectedCategoryCode,
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับเตรียมข้อมูลก่อนแก้ไข
  const handleEditClick = (row: ReportRow) => {
    const date = parseThaiDate(row.date);
    const isoDate = date.toISOString().split("T")[0];

    setSelectedNews(row);
    setNewsForm({
      reportDate: isoDate,
      title: row.title,
      content: row.content,
      source: String(
        row.sourceId
      ),
      link: row.link || "",
      category: String(
        row.categoryId
      ), // Use categoryId for the form select
    });
    setIsCreateNewsModalOpen(true);
  };

  // 1. คำนวณช่วงวันที่เพียงที่เดียวเพื่อให้ทั้ง UI และการ Filter ข้อมูลใช้ค่าเดียวกันเสมอ
  const { startDate, endDate } = useMemo(() => { // เปลี่ยน dependencies
    const start = new Date(selectedStartDateISO); // ใช้ selectedStartDateISO เป็นวันเริ่มต้น
    start.setHours(0, 0, 0, 0); // เริ่มต้นที่ต้นวัน

    const end = new Date(start); // สร้าง endDate จาก startDate
    if (days !== "all") {
      end.setDate(start.getDate() + (days - 1)); // บวกจำนวนวันตามที่เลือก
    }
    end.setHours(23, 59, 59, 999); // ครอบคลุมถึงเสี้ยววินาทีสุดท้ายของวัน

    return { startDate: start, endDate: end };
  }, [selectedStartDateISO, days]); // เปลี่ยน dependencies

  const displayedRows = useMemo(() => {
    return [...newsRows]
      .filter((row) => {
        const newsDate = parseThaiDate(row.date);

        if (days !== "all" && (newsDate < startDate || newsDate > endDate)) {
          return false;
        }

        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return true;

        const categoryText =
          row.category?.toLowerCase() || "";

        return (
          row.title.toLowerCase().includes(keyword) ||
          row.source.toLowerCase().includes(keyword) ||
          categoryText.includes(keyword)
        );
      })
      .sort((a, b) => {
        const valueA =
          a[sortColumn as keyof ReportRow];

        const valueB =
          b[sortColumn as keyof ReportRow];

        let compareResult = 0;

        if (
          typeof valueA === "number" &&
          typeof valueB === "number"
        ) {
          compareResult = valueA - valueB;
        } else {
          compareResult = String(valueA).localeCompare(
            String(valueB),
            "th"
          );
        }

        return sortOrder === "asc"
          ? compareResult
          : -compareResult;
      });
  }, [newsRows, searchTerm, sortOrder, startDate, endDate, sortColumn]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayedRows.slice(startIndex, startIndex + itemsPerPage);
  }, [displayedRows, currentPage]);

  const summaryCategoryLabels: SummaryCategoryLabel[] = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.category_id,
      label: cat.category_name,
      key: cat.category_code,
    }));
  }, [categories]);

  const categoryCodeToIdMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    categories.forEach(cat => {
      map[cat.category_code] = cat.category_id;
    });
    return map;
  }, [categories]);

  const categoryLabelMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    categories.forEach(cat => {
      map[cat.category_code] = cat.category_name;
    });
    return map;
  }, [categories]);

  const [summary, setSummary] = useState({
    summaryRows: [] as OfficeSummary[],
    totals: {} as Record<string, number>,
    summaryTotals: {} as Record<string, number>,
    newsRows: [] as ReportRow[],
    categories: [] as SummaryCategoryLabel[],
  });

  useEffect(() => {
    const rows = buildWebSummaryRows(displayedRows, categories);

    const totals: Record<string, number> = {};
    let grandTotal = 0;

    summaryCategoryLabels.forEach((c) => (totals[c.key] = 0));

    rows.forEach((row) => {
      summaryCategoryLabels.forEach((c) => {
        totals[c.key] += (row[c.key] as number) || 0;
      });
      grandTotal += row.total;
    });

    totals.total = grandTotal;

    setSummary({
      summaryRows: rows,
      totals,
      summaryTotals: totals,
      newsRows: displayedRows,
      categories: summaryCategoryLabels,
    });
  }, [displayedRows, categories]);

  const resetNewsForm = () => {
    setNewsForm({
      reportDate: "",
      title: "",
      content: "",
      source: "",
      link: "",
      category: "", // Reset category
    });
    setSelectedNews(null);
  };

  const handleCreateNews = async () => {
    try {
      const payload = {
        category_id: Number(
          newsForm.category
        ),

        source_id: Number(
          newsForm.source
        ),

        news_title:
          newsForm.title,

        news_summary:
          newsForm.content,

        news_url:
          newsForm.link,

        news_date:
          newsForm.reportDate,

      };

      if (selectedNews) {
        await fetch(`/api/news/${selectedNews.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await successAlert("แก้ไขข้อมูลสำเร็จ");
      } else {
        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await successAlert("บันทึกข้อมูลสำเร็จ");
      }

      await fetchNews();
      setIsCreateNewsModalOpen(false);
      resetNewsForm();
    } catch (error) {
      await errorAlert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await confirmDelete();
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) { throw new Error(data.error); }

      await successAlert("ลบข้อมูลเรียบร้อยแล้ว");
      fetchNews();
    } catch (error) {
      console.error(error);
      await errorAlert("ไม่สามารถลบข้อมูลได้");
    }
  };

  const summaryKeys = summaryCategoryLabels.map((c) => c.key);

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const selectedExcelRows: ReportRow[] = summary.newsRows; // Use summary.newsRows
    const selectedExcelDatasetLabel = "ทั้งหมด";

    // ---------------------------
    // HEADER (dynamic from DB)
    // ---------------------------
    const summaryHeader = [
      "ลำดับ",
      "หน่วยงาน",
      ...summaryCategoryLabels.map((c) => c.label),
      "รวมทั้งหมด",
    ];

    // ---------------------------
    // BODY (dynamic from DB keys)
    // ---------------------------
    const summaryBody = summary.summaryRows.map((item: OfficeSummary, index: number) => [
      index + 1,
      item.office,

      ...summaryKeys.map((key) => item[key] ?? "-"),

      item.total ?? 0,
    ]);

    // ---------------------------
    // TOTAL ROW
    // ---------------------------
    const summaryTotalRow = [
      "รวมทั้งหมด",
      "",

      ...summaryKeys.map((key) => summary.totals[key] ?? 0),

      summary.totals.total ?? 0,
    ];

    // ---------------------------
    // NEWS TABLE HEADER
    // ---------------------------
    const headerRow = exportColumns.map((c) => c.label);

    const bodyRows = selectedExcelRows.map((row: ReportRow) =>
      exportColumns.map((col) => row[col.key] ?? "")
    );

    // ---------------------------
    // COMPOSE SHEET DATA
    // ---------------------------
    const worksheetData: (string | number)[][] = [
      [`รายงานข่าวสำนักงานชลประทานที่ 4 (${selectedExcelDatasetLabel})`],
      [`พิมพ์เมื่อ ${new Date().toLocaleString("th-TH")}`],
      [],
      summaryHeader,
      ...summaryBody,
      summaryTotalRow,
      [],
      ["ลำดับ", ...headerRow],
      ...bodyRows.map((row, i) => [i + 1, ...row]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // ---------------------------
    // COLUMN WIDTH (dynamic-safe)
    // ---------------------------
    worksheet["!cols"] = summaryHeader.map(() => ({ wch: 18 }));

    // ---------------------------
    // MERGE TITLE
    // ---------------------------
    const totalCols = summaryHeader.length - 1;
    const summaryTableEndRow = 3 + summary.summaryRows.length + 1; // Header + summary rows + total row
    const newsTableHeaderRow = summaryTableEndRow + 2; // +2 for empty row and news header

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } },
      {
        s: { r: summaryTableEndRow, c: 0 }, // "รวมทั้งหมด" row for summary
        e: { r: summaryTableEndRow, c: 1 },
      },
    ];

    // ---------------------------
    // STYLE HELPERS
    // ---------------------------
    const applyStyle = (
      r: number,
      c: number,
      style: Record<string, any>
    ) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[ref]) return;

      worksheet[ref].s = {
        ...(worksheet[ref].s || {}),
        ...style,
      };
    };

    const allBorder = {
      top: { style: "thin", color: { rgb: "334155" } },
      bottom: { style: "thin", color: { rgb: "334155" } },
      left: { style: "thin", color: { rgb: "334155" } },
      right: { style: "thin", color: { rgb: "334155" } },
    };

    const headerFill = { fgColor: { rgb: "4F83D1" } };
    const titleFill = { fgColor: { rgb: "DBEAFE" } };
    // const summaryFill = { fgColor: { rgb: "EFF6FF" } }; // Not used

    // ---------------------------
    // TITLE STYLE
    // ---------------------------
    applyStyle(0, 0, {
      font: { bold: true, sz: 18, color: { rgb: "1E3A8A" } },
      fill: titleFill,
      alignment: { horizontal: "left", vertical: "center" },
    });

    applyStyle(1, 0, {
      font: { bold: true, sz: 11, color: { rgb: "475569" } },
      fill: titleFill,
    });

    // ---------------------------
    // SUMMARY HEADER STYLE
    // ---------------------------
    const summaryHeaderRowIndex = 3;

    for (let c = 0; c <= totalCols; c++) {
      applyStyle(summaryHeaderRowIndex, c, {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: headerFill,
        border: allBorder,
      });
    }

    // ---------------------------
    // NEWS HEADER ROW
    // ---------------------------
    const newsHeaderRowIndex = newsTableHeaderRow;

    for (let c = 0; c <= exportColumns.length; c++) {
      applyStyle(newsHeaderRowIndex, c, {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center" },
        fill: headerFill,
        border: allBorder,
      });
    }

    // ---------------------------
    // SUMMARY BODY STYLE
    // ---------------------------
    for (let r = 4; r < summaryTableEndRow; r++) { // From first summary data row to before summary total row
      for (let c = 0; c <= totalCols; c++) {
        applyStyle(r, c, {
          border: allBorder,
          alignment: {
            vertical: "center",
            horizontal: c === 1 ? "left" : "center",
            wrapText: true,
          },
          fill: {
            fgColor: { rgb: (r - 4) % 2 === 0 ? "FFFFFF" : "F8FAFC" }, // Adjust for summary body rows
          },
        });
      }
    }

    // ---------------------------
    // SUMMARY TOTAL ROW STYLE
    // ---------------------------
    for (let c = 0; c <= totalCols; c++) {
      applyStyle(summaryTableEndRow, c, {
        border: allBorder,
        alignment: {
          vertical: "center",
          horizontal: c === 1 ? "left" : "center",
          wrapText: true,
        },
        fill: { fgColor: { rgb: "E2E8F0" } }, // A different color for total row
        font: { bold: true },
      });
    }

    // ---------------------------
    // NEWS BODY STYLE
    // ---------------------------
    const newsBodyStartRow = newsTableHeaderRow + 1;
    for (let r = newsBodyStartRow; r <= newsBodyStartRow + selectedExcelRows.length - 1; r++) {
      for (let c = 0; c <= exportColumns.length; c++) { // exportColumns.length for the news table
        applyStyle(r, c, {
          border: allBorder,
          alignment: {
            vertical: "center",
            horizontal: c === 2 ? "left" : "center", // Title column is 2 (0-indexed)
            wrapText: true,
          },
          fill: {
            fgColor: { rgb: (r - newsBodyStartRow) % 2 === 0 ? "FFFFFF" : "F8FAFC" }, // Adjust for news body rows
          },
        });
      }
    }

    // ---------------------------
    // EXPORT
    // ---------------------------
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายงานข่าว");
    XLSX.writeFile(workbook, "news_report.xlsx");
  };

  const getCurrentMonthLabel = () => {
    const now = new Date();

    return new Intl.DateTimeFormat("th-TH", {
      month: "long",
      year: "numeric",
    }).format(now);
  };

  const handleExportPdf = async () => {
    const monthLabel = getCurrentMonthLabel();

    await exportPdf(
      {
        title: `รายงานสรุปข่าวสาร ประจำเดือน ${monthLabel}`,

        summaryRows: summary.summaryRows ?? [],

        summaryTotals: {
          ...summary.totals,
          total: summary.totals?.total ?? 0,
        },

        newsRows: summary.newsRows ?? [],
        categories: summary.categories ?? [],
      },
      "news_report.pdf"
    );
  };

  const reportSummary = [
    {
      label: "ข่าวทั้งหมด (ที่แสดง)",

      value: displayedRows.length,

      icon: <ArrowDownTrayIcon className="w-6 h-6" />,
    },

    {
      label: "โครงการอันเนื่องมาจากพระราชดำริ",

      value: displayedRows.filter((i) => i.category === "ROYAL").length,

      icon: <CalendarIcon className="w-6 h-6" />,
    },

    {
      label: "ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน",

      value: displayedRows.filter((i) => i.category === "WATER").length,

      icon: <FunnelIcon className="w-6 h-6" />,
    },

    {
      label: "ด้านบริหารจัดการน้ำ บรรเทาภัยอันเกิดจากน้ำ",

      value: displayedRows.filter((i) => i.category === "AGRI").length,

      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
    },

    {
      label: "ด้านการสร้างภาพลักษณ์องค์กร และอื่นๆ",

      value: displayedRows.filter((i) => i.category === "ENV").length,

      icon: <GlobeAltIcon className="w-6 h-6" />,
    },
  ];

  if (loading)
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
      <AppSidebar collapsed={collapsed} activePage="newsreport" />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <Header
          toggle={() => setCollapsed(!collapsed)}
          title="สรุปรายงานข่าว"
        />

        <div id="pdf-content" className="p-6 space-y-6 bg-white" style={{ backgroundColor: '#fff' }}>

          {/* Section Summary */}
          <div className="bg-white p-6 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold mt-2">สรุปรายงานข่าว</h1>
              <button
                onClick={() => {
                  setIsCreateNewsModalOpen(true);
                  resetNewsForm();
                }}
                className="inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95"
              >
                <span className="text-2xl font-light">+</span>
                เพิ่มรายการข่าวใหม่
              </button>
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
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">รายการข่าว</h2>

                <p className="text-sm text-slate-500">
                  แสดงข้อมูลข่าวสารล่าสุด
                </p>
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-3 ml-8">
                {/* ส่วนค้นหา */}
                <div className="w-64">
                  <SearchBox
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="ค้นหาข่าว..."
                  />
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden xl:block" />

                {/* ส่วนตัวเลือกวันที่ */}
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                  <span className="text-sm font-medium text-slate-700">จากวันที่:</span>
                  <ThaiDatePicker
                    id="filterStartDate"
                    label=""
                    value={selectedStartDateISO}
                    onChange={(value) => setSelectedStartDateISO(value)}
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                  {([7, 15, 30, "all"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${days === d
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {d === "all" ? "ทั้งหมด" : `${d} วัน`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm text-slate-600">
                  <CalendarIcon className="w-4 h-4" />
                  {isHydrated ? (
                    <span>
                      {days === "all" ? (
                        "รายการข่าวทั้งหมด"
                      ) : (
                        `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                      )}
                    </span>
                  ) : (
                    "..."
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1 hidden xl:block" />

                <div className="ml-auto">
                  <ExportButtons onExportExcel={exportToExcel} onExportPdf={handleExportPdf} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-600">

                  <tr>
                    {sortColumns.map((column, index) => (
                      <th
                        key={`${column.key}-${index}`}
                        onClick={() => {
                          if (sortColumn === "date") {
                            compareResult =
                              parseThaiDate(a.date).getTime() -
                              parseThaiDate(b.date).getTime();

                          } else {
                            setSortColumn(column.key);
                            setSortOrder("asc");
                          }
                        }}
                        className="px-4 py-3 text-center cursor-pointer select-none"
                      >
                        {column.label}
                      </th>
                    ))}

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      ลิงก์
                    </th>

                    <th className="px-4 py-3 text-center align-middle font-medium">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {paginatedRows.map((row: ReportRow) => (
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
                        {row.link ? (
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>เปิดลิงก์</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <button
                            title="ดูรายละเอียด"
                            onClick={() => { setSelectedNews(row); setIsViewModalOpen(true); }}
                            className="rounded-full p-2 transition hover:bg-slate-100"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>

                          <button
                            title="แก้ไข"
                            onClick={() => handleEditClick(row)}
                            className="rounded-full p-2 transition hover:bg-slate-100"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>

                          <button
                            title="ลบ"
                            onClick={() => handleDelete(row.id)}
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

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
              <p className="text-sm text-slate-500">
                แสดง {displayedRows.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} ถึง{" "}
                {Math.min(currentPage * itemsPerPage, displayedRows.length)} จาก {displayedRows.length} รายการ
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  ก่อนหน้า
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.ceil(displayedRows.length / itemsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage >= Math.ceil(displayedRows.length / itemsPerPage)}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  ถัดไป
                </button>
              </div>
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

                        {summaryCategoryLabels.map((category: SummaryCategoryLabel) => (
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
                      {summary.summaryRows.map((item, index) => (
                        <tr
                          key={item.office}
                          className="border-t border-slate-300 bg-white"
                        >
                          <td className="px-3 py-3 text-center">{index + 1}</td>

                          <td className="px-3 py-3 text-center font-semibold">
                            {item.office}
                          </td>

                          {summaryCategoryLabels.map((cat) => (
                            <td
                              key={cat.key}
                              className="px-3 py-3 text-center"
                            >
                              {item[cat.key] || "-"}
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

                        {summaryCategoryLabels.map((cat) => (
                          <td
                            key={cat.key}
                            className="px-3 py-3 text-center"
                          >
                            {summary.totals[cat.key] || "-"}
                          </td>
                        ))}

                        <td className="px-3 py-3 text-center">
                          {summary.totals.total || "-"}
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
      {
        isCreateNewsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-semibold">
                  {selectedNews ? "แก้ไขรายการข่าว" : "เพิ่มรายการข่าว"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedNews ? "แก้ไขข้อมูลข่าวสารที่มีอยู่แล้วในระบบ" : "กรอกข้อมูลข่าวเพื่อเพิ่มลงในตารางและสรุปอัตโนมัติ"}
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
                      value={newsForm.reportDate}
                      onChange={(value) =>
                        setNewsForm((prev) => ({ ...prev, reportDate: value }))
                      }
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    หน่วยงาน
                  </span>

                  <select
                    value={newsForm.source}
                    onChange={(event) =>
                      setNewsForm((prev) => ({
                        ...prev,
                        source: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">เลือกหน่วยงาน</option>
                    {sources.map((source) => (
                      <option
                        key={source.source_id}
                        value={source.source_id}
                      >
                        {source.source_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    หัวข้อข่าว
                  </span>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewsForm((prev) => ({
                        ...prev,
                        title: value,
                        category: String(categoryCodeToIdMap[detectNewsCategory(value, prev.content)] || ""),
                      }));
                    }}
                    placeholder="กรอกหัวข้อข่าวสั้นๆ สำหรับแสดงในตาราง"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    เนื้อหาข่าว
                  </span>

                  <textarea
                    value={newsForm.content}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewsForm((prev) => ({
                        ...prev,
                        content: value,
                        category: String(categoryCodeToIdMap[detectNewsCategory(prev.title, value)] || ""),
                      }));
                    }}
                    placeholder="กรอกเนื้อหาข่าว"
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    ลิงก์ข่าว (URL)
                  </span>
                  <input
                    type="url"
                    value={newsForm.link}
                    onChange={(event) =>
                      setNewsForm((prev) => ({ ...prev, link: event.target.value }))
                    }
                    placeholder="https://example.com/news/123"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    หมวดข่าว
                  </span>

                  <select
                    disabled
                    value={newsForm.category}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed"
                  >
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    ))}
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
        )
      }

      {/* Modal สำหรับแสดงรายละเอียดข่าว (View Mode) */}
      {
        isViewModalOpen && selectedNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-lg font-semibold">รายละเอียดข่าว</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">หัวข้อข่าว</label>
                  <p className="text-slate-700 font-medium text-lg mt-1">{selectedNews.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">วันที่/เวลา</label>
                    <p className="text-slate-700 mt-1">{selectedNews.date}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">หน่วยงาน</label>
                    <p className="text-slate-700 mt-1">{selectedNews.source}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">หมวดหมู่</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {categoryLabelMap[
                        selectedNews.category
                      ]}
                    </span>
                  </div>
                </div>
                {selectedNews.link && (
                  <div>
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">ลิงก์ข่าว</label>
                    <a
                      href={selectedNews.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline truncate mt-1 text-sm"
                    >
                      {selectedNews.link}
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="rounded-full bg-slate-100 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
