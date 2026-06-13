import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================
   TYPES
========================= */

interface SummaryRow {
  office: string;
  [key: string]: number | string;
  total: number;
}

interface SummaryTotals {
  [key: string]: number;
  total: number;
}

interface NewsRow {
  id: number;
  date: string;
  title: string;
  source: string;
  category: string;
}

interface Category {
  id: number;
  label: string;
  key: string;
}

/* =========================
   FONT HELPER
========================= */

const getFontBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(encodeURI(url));
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load font:", error);
    return "";
  }
};

/* =========================
   EXPORT PDF
========================= */

export const exportPdf = async (
  data: {
    title: string;
    summaryRows: SummaryRow[];
    summaryTotals: SummaryTotals;
    newsRows: NewsRow[];
    categories: Category[];
  },
  fileName = "report.pdf"
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  /* =========================
     FONT LOAD
  ========================= */

  const fontFileName = "THsarabunIT๙";
  const fontId = "THSarabunIT9";

  const fontBase64 = await getFontBase64(
    `/fonts/${fontFileName}.ttf`
  );

  if (fontBase64) {
    doc.addFileToVFS(`${fontId}.ttf`, fontBase64);
    doc.addFont(`${fontId}.ttf`, fontId, "normal");
    doc.addFont(`${fontId}.ttf`, fontId, "bold");
    doc.setFont(fontId);
  } else {
    doc.setFont("Helvetica");
  }

  /* =========================
     HEADER
  ========================= */

  const startX = 6;
  let currentY = 10;

  const tableStartY = 30;
  const titleY = tableStartY - 5;

  const sideMargin = 3;
  const gap = 2;

  doc.setFontSize(16);
  doc.text(data.title, startX, currentY);

  currentY += 7;
  doc.setFontSize(10);
  doc.text(
    `พิมพ์เมื่อ: ${new Date().toLocaleString("th-TH")}`,
    startX,
    currentY
  );

  currentY += 10;

  /* =========================
     SUMMARY TITLE
  ========================= */

  doc.setFontSize(12);
  doc.text(
    "สรุปรายงานข่าวแยกตามหน่วยงาน",
    startX,
    titleY
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  const halfWidth =
    (pageWidth - sideMargin * 2 - gap) / 2;

  /* =========================
     SUMMARY TABLE
  ========================= */

  const summaryHeader = [
    "ลำดับที่",
    "หน่วยงาน",
    ...data.categories.map((c) => c.label),
    "รวมทั้งสิ้น",
  ];

  autoTable(doc, {
    startY: tableStartY,
    tableWidth: halfWidth,
    margin: { left: sideMargin },

    head: [summaryHeader],

    body: [
      ...data.summaryRows.map((item, index) => [
        index + 1,
        item.office,

        ...data.categories.map(
          (c) => item[c.key] ?? 0
        ),

        item.total ?? 0,
      ]),

      [
        { content: "สรุปรวมทั้งสิ้น", colSpan: 2, styles: { fontStyle: "bold" } },

        ...data.categories.map(
          (c) => data.summaryTotals?.[c.key] ?? 0
        ),

        data.summaryTotals?.total ?? 0,
      ],
    ],

    styles: {
      font: fontBase64 ? fontId : "Helvetica",
      fontSize: 10,
      cellPadding: 1,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      halign: "center",
      fontStyle: "bold",
    },

    theme: "grid",
  });

  const summaryEndY = (doc as any).lastAutoTable.finalY;

  /* =========================
     CHART SAFE VALUE
  ========================= */

  const chartStartY = Math.max(summaryEndY + 15, 120);

  doc.setPage(1);
  doc.setFontSize(12);
  doc.text("กราฟสรุปจำนวนข่าว", startX, chartStartY);

  const chartX = 18;
  const chartY = chartStartY + 10;

  const officeCount = Math.max(data.summaryRows.length, 1);
  const chartWidth = halfWidth - 25;
  const chartHeight = 70;

  const groupWidth = chartWidth / officeCount;

  const colors = [
    [37, 99, 235],
    [5, 150, 105],
    [245, 158, 11],
    [220, 38, 38],
  ];

  const maxValue = Math.max(
    1,
    ...data.summaryRows.flatMap((r) =>
      data.categories.map((c) => Number(r[c.key]) || 0)
    )
  );

  /* =========================
     DRAW CHART
  ========================= */

  data.summaryRows.forEach((row, rowIndex) => {
    const values = data.categories.map((c, i) => ({
      value: Number(row[c.key]) || 0,
      color: colors[i % colors.length],
    }));

    const visible = values.filter((v) => v.value > 0);

    const width = Math.max(groupWidth / (visible.length || 1), 1);

    visible.forEach((v, i) => {
      const h = (v.value / maxValue) * chartHeight;

      const x =
        chartX + rowIndex * groupWidth + i * width;

      const y = chartY + chartHeight - h;

      doc.setFillColor(v.color[0], v.color[1], v.color[2]);
      doc.rect(x, y, width - 1, h, "F");

      doc.setFontSize(7);
      doc.text(
        String(v.value),
        x + 1,
        y - 2
      );
    });

    const name =
      row.office.length > 12
        ? row.office.slice(0, 12) + "..."
        : row.office;

    doc.text(
      name,
      chartX + rowIndex * groupWidth,
      chartY + chartHeight + 8,
      { angle: 45 }
    );
  });

  /* =========================
     LEGEND
  ========================= */

  let legendX = chartX;

  data.categories.forEach((c, i) => {
    const color = colors[i % colors.length];

    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(legendX, chartY + chartHeight + 15, 4, 4, "F");

    doc.setFontSize(8);
    doc.text(c.label, legendX + 6, chartY + 18 + chartHeight);

    legendX += 40;
  });

  /* =========================
     NEWS TABLE
  ========================= */

  const detailX = sideMargin + halfWidth + gap;
  const detailWidth = halfWidth;

  const chunks: NewsRow[][] = [];

  if (data.newsRows.length > 0) {
    chunks.push(data.newsRows.slice(0, 41));

    const rest = data.newsRows.slice(41);

    for (let i = 0; i < rest.length; i += 40) {
      chunks.push(rest.slice(i, i + 40));
    }
  }

  let index = 1;

  chunks.forEach((chunk, i) => {
    if (i > 0 && i % 2 === 0) doc.addPage();

    const x = i % 2 === 0 ? detailX : sideMargin;

    doc.setFontSize(12);
    doc.text("รายการข่าว", x, 20);

    autoTable(doc, {
      startY: 25,
      margin: { left: x },
      tableWidth: detailWidth,

      head: [["ลำดับ", "หัวข้อ", "วันที่", "หน่วยงาน"]],

      body: chunk.map((r) => [
        index++,
        r.title,
        new Date(r.date).toLocaleDateString("th-TH"),
        r.source,
      ]),

      styles: {
        font: fontBase64 ? fontId : "Helvetica",
        fontSize: 9,
        cellPadding: 1,
      },

      headStyles: {
        fillColor: [5, 150, 105],
        textColor: 255,
      },

      theme: "striped",
    });
  });

  /* =========================
     SAVE
  ========================= */

  doc.save(fileName);
};
