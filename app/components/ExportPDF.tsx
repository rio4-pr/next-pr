import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface SummaryRow {
  office: string;
  "royal-project": number;
  "water-development": number;
  "water-management": number;
  organization: number;
  total: number;
}

interface SummaryTotals {
  "royal-project": number;
  "water-development": number;
  "water-management": number;
  organization: number;
  total: number;
}

interface NewsRow {
  id: number;
  date: string;
  title: string;
  source: string;
  category: string;
}

// ฟังก์ชันช่วยแปลงไฟล์ฟอนต์เป็น Base64 แบบ Dynamic
const getFontBase64 = async (url: string): Promise<string> => {
  try {
    // ใช้ encodeURI เพื่อความปลอดภัยเมื่อชื่อไฟล์มีตัวอักษรพิเศษ (เช่น ๙)
    const response = await fetch(encodeURI(url));
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load font:", error);
    return "";
  }
};

export const exportPdf = async (
  data: {
    title: string;
    summaryRows: SummaryRow[];
    summaryTotals: SummaryTotals;
    newsRows: NewsRow[];
  },
  fileName = "report.pdf"
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // 1. โหลดฟอนต์ภาษาไทยจากโฟลเดอร์ public/fonts/
  const fontFileName = "THsarabunIT๙"; // ชื่อไฟล์จริงใน public/fonts/
  const fontId = "THSarabunIT9";      // ID ภาษาอังกฤษล้วนสำหรับ jsPDF (ASCII only)
  
  const fontBase64 = await getFontBase64(`/fonts/${fontFileName}.ttf`);

  if (fontBase64) {
    doc.addFileToVFS(`${fontId}.ttf`, fontBase64);
    doc.addFont(`${fontId}.ttf`, fontId, "normal");
    doc.addFont(`${fontId}.ttf`, fontId, "bold"); // ลงทะเบียนแบบ bold ด้วยไฟล์เดียวกัน
    doc.setFont(fontId);
    console.log("PDF: Thai font loaded successfully");
  } else {
    console.error("PDF: Failed to load Thai font from /fonts/" + fontFileName + ".ttf");
    doc.setFont("Courier"); // ใช้ Courier แทนเพื่อให้เห็นชัดว่าฟอนต์โหลดไม่เข้า
  }

  const startX = 14;
  let currentY = 20;

  // หัวข้อรายงาน
  doc.setFontSize(16);
  doc.text(data.title, startX, currentY);
  
  doc.setFontSize(10);
  currentY += 7;
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString("th-TH")}`, startX, currentY);
  currentY += 10;

  // --- ตารางสรุป (Summary) ---
  doc.setFontSize(12);
  doc.text("สรุปรายงานข่าวแยกตามหน่วยงาน", startX, currentY);
  
  autoTable(doc, {
    startY: currentY + 5,
    head: [[
      "ลำดับที่", 
      "หน่วยงาน / ส่วนงาน", 
      "โครงการอันเนื่องมาจากพระราชดำริ", 
      "ด้านการพัฒนาแหล่งน้ำ", 
      "ด้านการบริหารจัดการน้ำ", 
      "ด้านภาพลักษณ์องค์กร", 
      "รวมทั้งสิ้น"
    ]],
    body: [
      ...data.summaryRows.map((item, index) => [
        index + 1,
        item.office,
        item["royal-project"] > 0 ? item["royal-project"] : "-",
        item["water-development"] > 0 ? item["water-development"] : "-",
        item["water-management"] > 0 ? item["water-management"] : "-",
        item.organization > 0 ? item.organization : "-",
        item.total || "-"
      ]),
      [
        { content: "สรุปรวมทั้งสิ้น", colSpan: 2, styles: { halign: 'center', font: fontBase64 ? fontId : "Helvetica", fontStyle: 'bold' } },
        data.summaryTotals["royal-project"],
        data.summaryTotals["water-development"],
        data.summaryTotals["water-management"],
        data.summaryTotals.organization,
        data.summaryTotals.total
      ]
    ],
    styles: {
      font: fontBase64 ? fontId : "Helvetica", 
      fontSize: 14, // ปรับขนาดให้ใหญ่ขึ้นเพื่อให้ Sarabun อ่านง่าย
      cellPadding: 2 
    },
    bodyStyles: {
      font: fontBase64 ? fontId : "Helvetica",
    },
    headStyles: { 
      font: fontBase64 ? fontId : "Helvetica", 
      fontStyle: 'bold',
      fillColor: [30, 58, 138], // กลับมาใช้สีน้ำเงินเข้ม
      textColor: [255, 255, 255], // ตัวอักษรสีขาว
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 40 },
    },
    theme: "grid", // ใส่เส้นตารางกลับเข้าไป
  });

  currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // --- ตารางรายการข่าว (Details) ---
  doc.text("รายการข่าว", startX, currentY);

  autoTable(doc, {
    startY: currentY + 5,
    head: [["ลำดับ", "วันที่/เวลา", "หัวข้อข่าว", "แหล่งข่าว"]],
    body: data.newsRows.map(row => [
      row.id,
      row.date.replace(" น.", ""),
      row.title,
      row.source
    ]),
    styles: {
      font: fontBase64 ? fontId : "Helvetica", 
      fontSize: 13, 
      cellPadding: 2 
    },
    bodyStyles: {
      font: fontBase64 ? fontId : "Helvetica",
    },
    headStyles: { 
      font: fontBase64 ? fontId : "Helvetica", 
      fontStyle: 'bold',
      fillColor: [5, 150, 105], // กลับมาใช้สีเขียว
      textColor: [255, 255, 255] // ตัวอักษรสีขาว
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
    theme: "striped", // ใส่แถบสีสลับบรรทัดให้ดูง่าย
  });

  doc.save(fileName);
};