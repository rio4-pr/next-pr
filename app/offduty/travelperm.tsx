"use client";

import { jsPDF } from "jspdf";

export interface TravelPermissionData {
  documentNo: string;
  subject: string;
  recipient: string;
  title: string;
  fullName: string;
  position: string;
  department: string;
  departmentType?: string;
  destination: string;
  province: string;
  objective: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  totalDays: string;
  orderedBy?: string;
  companions: { name: string; position: string }[];
  replacementName?: string;
  replacementPosition?: string;
  vehicleNo?: string;
  requesterName: string;
  requesterPosition: string;
  approverName: string;
  approverPosition: string;
  approveDate: string;
}

export const TITLE_OPTIONS = ["นาย", "นาง", "นางสาว"];
export const DEPT_TYPE_OPTIONS = ["กอง", "สชป.", "โครงการ"];

const getBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(blob);
  });
};

// ฟังก์ชันใหม่สำหรับล้างปัญหาพื้นหลังดำ โดยการวาดทับบนพื้นขาว (Flatten)
const getImageAsJpeg = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context error");
      ctx.fillStyle = "#FFFFFF"; // บังคับพื้นหลังขาว
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95).split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
};

const drawDashedLine = (doc: jsPDF, x1: number, y1: number, x2: number) => {
  doc.setLineDashPattern([0.5, 0.5], 0);
  doc.setDrawColor(0);
  doc.line(x1, y1, x2, y1);
  doc.setLineDashPattern([], 0);
};

export const exportTravelPdf = async (data: TravelPermissionData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 1. โหลดฟอนต์ภาษาไทย (อ้างอิงจากไฟล์ที่มีในโปรเจกต์)
  const fontBase64 = await getBase64("/fonts/THsarabunIT๙.ttf");
  const fontId = "THSarabunIT9";

  doc.addFileToVFS(`${fontId}.ttf`, fontBase64);
  doc.addFont(`${fontId}.ttf`, fontId, "normal");
  doc.setFont(fontId);

  // 2. วาดตราครุฑ
  try {
    const garudaBase64 = await getImageAsJpeg("/garuda.png");

    const garudaSize = 15; // กำหนดขนาดเป็น 15 มม. (1.5 ซม.)
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - garudaSize) / 2; // คำนวณตำแหน่ง X เพื่อให้อยู่กึ่งกลางหน้า

    doc.addImage(garudaBase64, "JPEG", x, 10, garudaSize, garudaSize);
  } catch (e) {
    console.error("Garuda image not found or failed to load:", e);
  }

  // 3. เริ่มเขียนเนื้อหา (ชป.๓๘๔)
  const leftMargin = 20;
  const contentWidth = 170;
  const rightEdge = leftMargin + contentWidth;

  doc.setFontSize(14);
  doc.text("กรมชลประทาน", leftMargin, 20);
  doc.text("กระทรวงเกษตรและสหกรณ์", leftMargin, 25);

  doc.setFontSize(14);
  doc.text("ชป.๓๑๘", rightEdge, 20, { align: "right" });

  doc.setFontSize(20);
  doc.text("แบบขออนุญาตไปราชการ", 105, 37, { align: "center" });

  doc.setFontSize(14);
  const docNoText = `ที่  ${data.documentNo || ""}`;
  doc.text(docNoText, rightEdge, 46, { align: "right" });
  const docNoWidth = doc.getTextWidth(docNoText);
  const labelDocWidth = doc.getTextWidth("ที่  ");
  // วาดเส้นปะใต้เลขที่หนังสือขออนุญาต ให้เริ่มต่อจากคำว่า "ที่" ไปจนสุดบรรทัด
  drawDashedLine(
    doc,
    rightEdge - docNoWidth + labelDocWidth,
    46 + 1,
    rightEdge,
  );

  let y = 55;

  doc.text(`เรื่อง   ${data.subject}`, leftMargin, y);
  y += 8;

  const labelRecipient = "เรียน";
  doc.text(labelRecipient, leftMargin, y);
  const recipientLineStartX = leftMargin + doc.getTextWidth(labelRecipient);
  doc.text("   " + data.recipient, recipientLineStartX, y);
  // วาดเส้นปะใต้ผู้รับ ชิดกับคำว่า เรียน
  drawDashedLine(doc, recipientLineStartX, y + 1, leftMargin + 60);
  y += 12;

  // บรรทัดที่ 1: ข้าพเจ้า (ย่อหน้า)
  const prefix1 = "ข้าพเจ้า ";
  doc.text(prefix1, leftMargin + 20, y);
  let currentX1 = leftMargin + 20 + doc.getTextWidth(prefix1);
  const strikeY1 = y - 1.2;

  ["นาย", " / ", "นาง", " / ", "นางสาว"].forEach((text) => {
    doc.text(text, currentX1, y);
    if (["นาย", "นาง", "นางสาว"].includes(text) && data.title !== text) {
      doc.line(
        currentX1,
        strikeY1,
        currentX1 + doc.getTextWidth(text),
        strikeY1,
      );
    }
    currentX1 += doc.getTextWidth(text);
  });

  const nameLineStartX = currentX1;
  const titleAndName =
    data.title && !data.fullName.startsWith(data.title)
      ? data.title + data.fullName
      : data.fullName;
  doc.text("   " + titleAndName, nameLineStartX, y);
  drawDashedLine(doc, nameLineStartX, y + 1, rightEdge);
  y += 7;

  // บรรทัดที่ 2: ตำแหน่ง (ไม่ย่อหน้า)
  const startX = leftMargin;
  const lineY = y + 1;

  // label ตำแหน่ง
  const labelPos = "ตำแหน่ง";
  doc.text(labelPos, startX, y);

  // value ตำแหน่ง
  const positionLineStartX = startX + doc.getTextWidth(labelPos);
  doc.text("   " + data.position, positionLineStartX, y);

  const deptLabelX = 110;
  let currentXDept = deptLabelX;
  doc.text("    ", currentXDept, y);
  currentXDept += doc.getTextWidth("    ");
  const strikeYDept = y - 1.2;

  ["กอง", " / ", "สชป.", " / ", "โครงการ", " "].forEach((text) => {
    doc.text(text, currentXDept, y);
    if (
      ["กอง", "สชป.", "โครงการ"].includes(text) &&
      data.departmentType &&
      data.departmentType !== text
    ) {
      doc.line(
        currentXDept,
        strikeYDept,
        currentXDept + doc.getTextWidth(text),
        strikeYDept,
      );
    }
    currentXDept += doc.getTextWidth(text);
  });

  // เส้นปะหลังตำแหน่งให้ชิดคำว่า ตำแหน่ง และ สังกัด
  const deptLabelTextStartX = deptLabelX + doc.getTextWidth("    ");
  drawDashedLine(doc, positionLineStartX, lineY, deptLabelTextStartX);

  // ชื่อฝ่าย
  const deptLineStartX = currentXDept;
  const availableWidth = rightEdge - deptLineStartX;
  const deptVal = data.department;

  let firstLineText = deptVal;
  let secondLineText = "";

  if (doc.getTextWidth(deptVal) > availableWidth) {
    let splitIndex = deptVal.length;
    while (
      splitIndex > 0 &&
      doc.getTextWidth(deptVal.substring(0, splitIndex)) > availableWidth
    ) {
      splitIndex--;
    }
    const lastSpace = deptVal.lastIndexOf(" ", splitIndex);
    const actualSplit =
      lastSpace > 0 && lastSpace > splitIndex - 10 ? lastSpace : splitIndex;
    firstLineText = deptVal.substring(0, actualSplit).trim();
    secondLineText = deptVal.substring(actualSplit).trim();
  }

  doc.text("   " + firstLineText, deptLineStartX, y);
  drawDashedLine(doc, deptLineStartX, lineY, rightEdge);

  if (secondLineText) {
    y += 7;
    doc.text(secondLineText, startX, y);
    drawDashedLine(doc, startX, y + 1, rightEdge);
  }

  y += 7;

  const labelReq = "ขออนุญาตไปราชการ";
  doc.text(labelReq, leftMargin, y);
  const destLineStartX = leftMargin + doc.getTextWidth(labelReq);
  doc.text("   " + data.destination, destLineStartX, y);

  const provLabelX = 135;
  const labelProv = "จังหวัด";
  doc.text(labelProv, provLabelX, y);
  const provLineStartX = provLabelX + doc.getTextWidth(labelProv);
  doc.text("   " + data.province, provLineStartX, y);

  // วาดเส้นปะใต้ปลายทางและจังหวัด ชิดตัวอักษร
  drawDashedLine(doc, destLineStartX, y + 1, provLabelX);
  drawDashedLine(doc, provLineStartX, y + 1, rightEdge);
  y += 7;

  const labelFor = "เพื่อ";
  doc.text(labelFor, leftMargin, y);
  const forLineStartX = leftMargin + doc.getTextWidth(labelFor);
  doc.text("   " + data.objective, forLineStartX, y);

  const cmdLabelX = 135;
  const labelCmd = "ตามคำสั่งของ";
  doc.text(labelCmd, cmdLabelX, y);
  const cmdValX = cmdLabelX + doc.getTextWidth(labelCmd);
  doc.text("   " + (data.orderedBy || "-"), cmdValX, y);

  // วาดเส้นปะใต้ปลายทางและใต้ผู้สั่งการ
  drawDashedLine(doc, forLineStartX, y + 1, cmdLabelX);
  drawDashedLine(doc, cmdValX, y + 1, rightEdge);
  y += 7;

  const labelDep = "โดยจะออกเดินทางในวันที่";
  doc.text(labelDep, leftMargin, y);
  const depLineStartX = leftMargin + doc.getTextWidth(labelDep);

  const depValue = `${data.departureDate} (เวลา ${data.departureTime})`;
  doc.text("   " + depValue, depLineStartX, y);
  const depValWidth = doc.getTextWidth("   " + depValue);

  const labelRet = "   และจะกลับประมาณวันที่";
  const retLabelX = depLineStartX + depValWidth;
  doc.text(labelRet, retLabelX, y);

  const retLineStartX = retLabelX + doc.getTextWidth(labelRet);
  doc.text("   " + data.returnDate, retLineStartX, y);

  // วาดเส้นปะใต้วันที่ออกเดินทางและวันกลับ ชิดตัวอักษร
  drawDashedLine(
    doc,
    depLineStartX,
    y + 1,
    retLabelX + doc.getTextWidth("   "),
  );
  drawDashedLine(doc, retLineStartX, y + 1, rightEdge);
  y += 7;

  const compCount = (data.companions || []).length;
  const labelTotal = "รวมเวลาไปราชการในครั้งนี้";
  doc.text(labelTotal, leftMargin, y);
  const daysLineStartX = leftMargin + doc.getTextWidth(labelTotal);

  doc.text("   " + data.totalDays, daysLineStartX, y);
  const daysWidth = doc.getTextWidth("   " + data.totalDays);

  const labelComp =
    "   วัน  ในการไปราชการครั้งนี้ ข้าพเจ้าขอให้มีผู้ร่วมเดินทางไปด้วย รวม";
  const compLabelX = daysLineStartX + daysWidth;
  doc.text(labelComp, compLabelX, y);
  const compLabelWidth = doc.getTextWidth(labelComp);

  const compCountX = compLabelX + compLabelWidth;
  const compCountStr = compCount.toString();
  doc.text("   " + compCountStr, compCountX, y);
  const compCountWidth = doc.getTextWidth("   " + compCountStr);

  const labelEnd = "   คน ดังนี้";
  const endLabelX = compCountX + compCountWidth;
  doc.text(labelEnd, endLabelX, y);
  const endLabelWidth = doc.getTextWidth(labelEnd);

  // วาดเส้นปะใต้จำนวนวัน และจำนวนคน ชิดตัวอักษร
  drawDashedLine(
    doc,
    daysLineStartX,
    y + 1,
    compLabelX + doc.getTextWidth("   "),
  );
  drawDashedLine(doc, compCountX, y + 1, endLabelX + doc.getTextWidth("   "));
  y += 3;

  // ตารางลำดับ รายชื่อ ตำแหน่ง (มีขอบและเส้นแนวตั้ง-แนวนอนเป็นเส้นปะ)
  const tableTop = y;
  const headerHeight = 12;
  const rowHeight = 10;
  // เพิ่มครึ่งบรรทัดใต้เส้นปะก่อนถึงเส้นทึบ โดยเพิ่มความสูงเป็น 7 แถว + 5 (ครึ่งบรรทัด)
  const totalTableHeight = headerHeight + 7 * rowHeight + 5;

  // บีบตารางจากด้านข้างเข้ามานิดหน่อย
  const tableLeftMargin = leftMargin + 2;
  const tableContentWidth = contentWidth - 0;
  const tableRightEdge = tableLeftMargin + tableContentWidth;

  // วาดกรอบนอกและเส้นแบ่งคอลัมน์ (เส้นทึบ)
  doc.rect(tableLeftMargin, tableTop, tableContentWidth, totalTableHeight);

  const col1Width = 15;
  const col2Width = 70; // ลดลงเนื่องจากบีบความกว้างรวม
  const col1X = tableLeftMargin;
  const col2X = tableLeftMargin + col1Width;
  const col3X = col2X + col2Width;

  // เส้นประแบ่งแถว 1 ถึง 7
  for (let i = 1; i <= 7; i++) {
    const rowY = tableTop + headerHeight + i * rowHeight;
    doc.setLineDashPattern([0.5, 0.5], 0);
    // เส้นช่วงที่ 1 (ชื่อ) เว้นก่อนชนคอลัมน์ถัดไป
    doc.line(col2X + 2, rowY, col3X - 4, rowY);
    // เส้นช่วงที่ 2 (ตำแหน่ง) เว้นก่อนชนขอบขวา
    doc.line(col3X + 2, rowY, tableRightEdge - 4, rowY);
    doc.setLineDashPattern([], 0);
  }

  // ข้อความหัวตาราง (มีเส้นขีดเส้นใต้เฉพาะคำ)
  const col1HeaderCenterX = col1X + col1Width / 2;
  doc.text("ลำดับที่", col1HeaderCenterX, tableTop + 7, { align: "center" });
  const lamdabWidth = doc.getTextWidth("ลำดับที่");
  doc.line(
    col1HeaderCenterX - lamdabWidth / 2,
    tableTop + 8,
    col1HeaderCenterX + lamdabWidth / 2,
    tableTop + 8,
  );

  const nameHeaderX = col2X + col2Width / 2;
  doc.text("รายชื่อ", nameHeaderX, tableTop + 7, { align: "center" });
  const nameHeaderWidth = doc.getTextWidth("รายชื่อ");
  doc.line(
    nameHeaderX - nameHeaderWidth / 2,
    tableTop + 8,
    nameHeaderX + nameHeaderWidth / 2,
    tableTop + 8,
  );

  const posHeaderX = col3X + (tableRightEdge - col3X) / 2;
  doc.text("ตำแหน่ง", posHeaderX, tableTop + 7, { align: "center" });
  const posHeaderWidth = doc.getTextWidth("ตำแหน่ง");
  doc.line(
    posHeaderX - posHeaderWidth / 2,
    tableTop + 8,
    posHeaderX + posHeaderWidth / 2,
    tableTop + 8,
  );

  // ข้อความในตารางแถว 1-7
  const thaiNumerals = ["๑", "๒", "๓", "๔", "๕", "๖", "๗"];
  for (let i = 0; i < 7; i++) {
    const rowBaselineY = tableTop + headerHeight + i * rowHeight + 6.5;
    doc.text(thaiNumerals[i], col1HeaderCenterX, rowBaselineY, {
      align: "center",
    });

    if (i < 7) {
      // แถว 1-7 ดึงจาก companions
      if (data.companions && data.companions[i]) {
        const comp = data.companions[i];
        doc.text(comp.name, col2X + 3, rowBaselineY);

        // ตัดคำสำหรับตำแหน่งหากยาวเกินคอลัมน์
        const maxPosWidth = tableRightEdge - col3X - 6;
        const posLines = doc.splitTextToSize(comp.position, maxPosWidth);
        if (posLines.length > 1) {
          doc.text(posLines[0], col3X + 3, rowBaselineY - 2);
          doc.text(posLines[1], col3X + 3, rowBaselineY + 2.5);
        } else {
          doc.text(comp.position, col3X + 3, rowBaselineY);
        }
      }
    }
  }

  y += totalTableHeight + 7;

  // ในระหว่างที่ข้าพเจ้าไปราชการนี้
  const prefixRepl = "ในระหว่างที่ข้าพเจ้าไปราชการนี้  ขออนุมัติให้ ";
  doc.text(prefixRepl, leftMargin + 20, y);
  let currentXRepl = leftMargin + 20 + doc.getTextWidth(prefixRepl);
  const strikeYRepl = y - 1.2;

  const replName = data.replacementName || "";
  const replTitle = replName.startsWith("นางสาว")
    ? "นางสาว"
    : replName.startsWith("นาง")
      ? "นาง"
      : replName.startsWith("นาย")
        ? "นาย"
        : "";

  ["นาย", " / ", "นาง", " / ", "นางสาว"].forEach((text) => {
    doc.text(text, currentXRepl, y);
    if (
      ["นาย", "นาง", "นางสาว"].includes(text) &&
      replTitle &&
      replTitle !== text
    ) {
      doc.line(
        currentXRepl,
        strikeYRepl,
        currentXRepl + doc.getTextWidth(text),
        strikeYRepl,
      );
    }
    currentXRepl += doc.getTextWidth(text);
  });

  const replNameLineStartX = currentXRepl;
  doc.text("   " + replName, replNameLineStartX, y);
  drawDashedLine(doc, replNameLineStartX, y + 1, rightEdge);

  y += 5;

  const labelRepl2 = "ตำแหน่ง";
  doc.text(labelRepl2, leftMargin, y);
  const replPosLineStartX = leftMargin + doc.getTextWidth(labelRepl2);
  const replPos = data.replacementPosition || "";
  doc.text("   " + replPos, replPosLineStartX, y);
  const replPosWidth = doc.getTextWidth("   " + replPos);

  const labelRepl3 = "   ปฏิบัติหน้าที่แทน และขออนุมัติใช้";
  const replLabel3X = 95;
  doc.text(labelRepl3.trim(), replLabel3X, y);

  const vehicleX = replLabel3X + doc.getTextWidth(labelRepl3.trim());
  const vehicle = data.vehicleNo || "";
  doc.text("   " + vehicle, vehicleX, y);

  // เส้นปะตำแหน่งผู้รับการมอบหมายงานและพาหนะ ชิดตัวอักษร
  drawDashedLine(doc, replPosLineStartX, y + 1, replLabel3X);
  drawDashedLine(doc, vehicleX, y + 1, rightEdge);

  y += 7;
  doc.text(
    "เป็นพาหนะเดินทาง  เมื่อกลับจากราชการแล้ว  ข้าพเจ้าจะได้ทำรายงานเสนอตามระเบียบ",
    leftMargin,
    y,
  );

  y += 8;
  // ย้ายมาอยู่ฝั่งกลางของครึ่งซ้าย (พิกัด 62.5 มม.)
  doc.text("จึงเรียนมาเพื่อโปรดพิจารณา", 59, y, { align: "center" });

  // แยกตำแหน่ง Y ของฝั่งซ้ายและฝั่งขวา
  const rightYStart = y + 10; // ตำแหน่งเดิมของผู้ขอ
  const leftYStart = y + 31; // เริ่มส่วนลงชื่อผู้อนุญาตต่อจากบรรทัด "อนุญาต"
  const sigX = 125;

  // --- ฝั่งขวา (ผู้ขออนุญาต) ---
  let rY = rightYStart;
  doc.text("(ลงชื่อ)", sigX, rY);
  const rSigLineStartX = sigX + doc.getTextWidth("(ลงชื่อ)");
  drawDashedLine(doc, rSigLineStartX, rY + 1, rightEdge);

  rY += 7;
  doc.text(`(${data.requesterName})`, (rSigLineStartX + rightEdge) / 2, rY, {
    align: "center",
  });

  rY += 7;
  doc.text("ตำแหน่ง", sigX, rY);
  const rPosValX = sigX + doc.getTextWidth("ตำแหน่ง");
  doc.text(data.requesterPosition, (rPosValX + rightEdge) / 2, rY, {
    align: "center",
  });
  drawDashedLine(doc, rPosValX, rY + 1, rightEdge);

  rY += 7;
  doc.text("วันที่", sigX, rY);
  const rDateValX = sigX + doc.getTextWidth("วันที่");
  doc.text(data.approveDate || "", (rDateValX + rightEdge) / 2, rY, {
    align: "center",
  });
  drawDashedLine(doc, rDateValX, rY + 1, rightEdge);

  // --- ฝั่งซ้าย (ผู้อนุญาต) ---
  // คำว่าอนุญาต ขยับไปทางซ้ายนิดนึงและขยับขึ้นมาเพื่อให้มีที่ว่างเอาไว้เซ็นลายเซ็น
  doc.text("อนุญาต", 52.5, y + 18, { align: "center" });

  let lY = leftYStart;
  doc.text("(ลงชื่อ)", leftMargin, lY);
  const lSigLineStartX = leftMargin + doc.getTextWidth("(ลงชื่อ)");
  const lSigLineEndX = leftMargin + 65;
  drawDashedLine(doc, lSigLineStartX, lY + 1, lSigLineEndX);

  lY += 7;
  doc.text(
    "(นางสาวมนัสนันท์ เพชรทองทวีคูณ)",
    (lSigLineStartX + lSigLineEndX) / 2,
    lY,
    { align: "center" },
  );

  lY += 7;
  doc.text("ตำแหน่ง", leftMargin, lY);
  const lAppPosValX = leftMargin + doc.getTextWidth("ตำแหน่ง");
  doc.text("   ผบท.ชป.4 ปฏิบัติราชการแทน อธช.", lAppPosValX, lY);
  drawDashedLine(doc, lAppPosValX, lY + 1, leftMargin + 65);

  // --- Page 2 ---
  doc.addPage();
  doc.setFont(fontId);

  let y2 = 20;
  doc.setFontSize(16);
  doc.text("บันทึกรับรองการเดินทางไปราชการ", 105, y2, { align: "center" });
  y2 += 12;

  doc.setFontSize(14);
  const labelTraveller = "ชื่อผู้ไปราชการ";
  doc.text(labelTraveller, leftMargin, y2);
  const travellerNameX = leftMargin + doc.getTextWidth(labelTraveller) + 2;
  const fullnameWithTitle = data.title && !data.fullName.startsWith(data.title)
    ? data.title + data.fullName
    : data.fullName;
  doc.text(fullnameWithTitle, travellerNameX + 5, y2 - 0.5);
  drawDashedLine(doc, travellerNameX, y2 + 1, leftMargin + 85);

  const labelPosition = "ตำแหน่ง";
  const positionLabelX = leftMargin + 95;
  doc.text(labelPosition, positionLabelX, y2);
  const travellerPosX = positionLabelX + doc.getTextWidth(labelPosition) + 2;
  doc.text(data.position, travellerPosX + 5, y2 - 0.5);
  drawDashedLine(doc, travellerPosX, y2 + 1, rightEdge);
  y2 += 12;

  doc.text("รายชื่อผู้ร่วมเดินทางไปราชการ", 105, y2, { align: "center" });
  y2 += 6;

  const table2Left = leftMargin;
  const table2Width = contentWidth;
  const table2Right = rightEdge;
  const header2Height = 10;
  const row2Height = 8;
  const totalTable2Height = header2Height + 7 * row2Height;

  // Draw table border and headers (solid lines)
  doc.rect(table2Left, y2, table2Width, totalTable2Height);
  doc.line(table2Left, y2 + header2Height, table2Right, y2 + header2Height); // under header line

  const col2_1Width = 20;
  const col2_2Width = 75;
  const col2_1X = table2Left;
  const col2_2X = col2_1X + col2_1Width;
  const col2_3X = col2_2X + col2_2Width;

  // Draw vertical lines
  doc.line(col2_2X, y2, col2_2X, y2 + totalTable2Height);
  doc.line(col2_3X, y2, col2_3X, y2 + totalTable2Height);

  // Headers
  const centerText = (text: string, xStart: number, width: number, yPos: number) => {
    doc.text(text, xStart + width / 2, yPos, { align: "center" });
  };
  centerText("ลำดับที่", col2_1X, col2_1Width, y2 + 6.5);
  centerText("รายชื่อ", col2_2X, col2_2Width, y2 + 6.5);
  centerText("ตำแหน่ง", col2_3X, table2Right - col2_3X, y2 + 6.5);

  // Rows
  const thaiNumerals2 = ["๑", "๒", "๓", "๔", "๕", "๖", "๗"];
  for (let i = 0; i < 7; i++) {
    const rowY = y2 + header2Height + i * row2Height;
    // horizontal lines
    if (i < 6) {
      doc.line(table2Left, rowY + row2Height, table2Right, rowY + row2Height);
    }
    const baselineY = rowY + 5.5;
    centerText(thaiNumerals2[i], col2_1X, col2_1Width, baselineY);

    if (data.companions && data.companions[i]) {
      const comp = data.companions[i];
      doc.text(comp.name, col2_2X + 3, baselineY);
      doc.text(comp.position, col2_3X + 3, baselineY);
    }
  }

  y2 += totalTable2Height + 12;

  doc.text("รายการเดินทางไปราชการ", 105, y2, { align: "center" });
  y2 += 6;

  const table3Left = leftMargin;
  const table3Width = contentWidth;
  const table3Right = rightEdge;
  const header3Height = 15;
  const row3Height = 7;
  const summaryHeight = 8;
  const dataRowsCount = 14;
  const totalTable3Height = header3Height + dataRowsCount * row3Height + summaryHeight;

  // Draw table border and vertical lines
  doc.rect(table3Left, y2, table3Width, totalTable3Height);

  // Column X positions
  const c1_w = 28;
  const c2_w = 24;
  const c3_w = 28;
  const c4_w = 24;
  const c5_w = 20;
  const c6_w = 46;

  const cx1 = table3Left;
  const cx2 = cx1 + c1_w;
  const cx3 = cx2 + c2_w;
  const cx4 = cx3 + c3_w;
  const cx5 = cx4 + c4_w;
  const cx6 = cx5 + c5_w;

  // Draw column dividers (vertical lines)
  doc.line(cx2, y2, cx2, y2 + totalTable3Height);
  doc.line(cx3, y2, cx3, y2 + totalTable3Height);
  doc.line(cx4, y2, cx4, y2 + totalTable3Height);
  doc.line(cx5, y2, cx5, y2 + totalTable3Height);
  doc.line(cx6, y2, cx6, y2 + totalTable3Height);

  // Draw header line
  doc.line(table3Left, y2 + header3Height, table3Right, y2 + header3Height);

  // Header Texts
  doc.setFontSize(12);
  centerText("เดินทางจาก", cx1, c1_w, y2 + 9);
  centerText("วันที่   เวลา", cx2, c2_w, y2 + 9);
  centerText("เดินทางถึง", cx3, c3_w, y2 + 9);
  centerText("วันที่   เวลา", cx4, c4_w, y2 + 9);
  centerText("ปฏิบัติ", cx5, c5_w, y2 + 6.0);
  centerText("ราชการ วัน", cx5, c5_w, y2 + 11.0);
  centerText("ลายมือชื่อผู้", cx6, c6_w, y2 + 5.0);
  centerText("รับรอง", cx6, c6_w, y2 + 9.0);
  centerText("การปฏิบัติราชการ", cx6, c6_w, y2 + 13.0);

  // Draw data rows
  doc.setFontSize(11);
  for (let i = 0; i < dataRowsCount; i++) {
    const rowY = y2 + header3Height + i * row3Height;
    doc.line(table3Left, rowY + row3Height, table3Right, rowY + row3Height);
  }

  // Draw summary row at the bottom
  const summaryY = y2 + header3Height + dataRowsCount * row3Height;
  doc.setFont(fontId, "normal");
  doc.text("รวมเวลาปฏิบัติราชการ", cx5 - 2, summaryY + 5.5, { align: "right" });

  y2 += totalTable3Height + 10;

  doc.setFontSize(14);
  const noteLabel = "หมายเหตุ";
  doc.text(noteLabel, leftMargin, y2);
  const noteLabelWidth = doc.getTextWidth(noteLabel);
  doc.line(leftMargin, y2 + 1, leftMargin + noteLabelWidth, y2 + 1);
  drawDashedLine(doc, leftMargin + noteLabelWidth + 5, y2, rightEdge);

  doc.save(`travel-permission-${data.documentNo}.pdf`);
};

// Mock Data สำหรับทดสอบดึงไปใช้
export const mockTravelData: TravelPermissionData = {
  // Current selection is here.
  documentNo: "สปช4.01ธก.(ชป318)/", // เพิ่มเครื่องหมาย / เพื่อให้ Modal เริ่มต้นด้วยช่องว่าง
  subject: "ขออนุญาตไปราชการ",
  recipient: "ผส.ชป.4",
  orderedBy: "ผบท.ชป.4",
  title: "นาย",
  fullName: "สมชาย ใจดี",
  position: "วิศวกรชลประทาน",
  department: "ฝ่ายจัดการน้ำ",
  departmentType: "กอง",
  destination: "เขื่อนภูมิพล",
  province: "ตาก",
  objective: "เพื่อติดตามสถานการณ์น้ำและตรวจสอบความมั่นคงของเขื่อนในช่วงฤดูฝน",
  departureDate: "10 มิ.ย. 2567",
  departureTime: "08.30 น.",
  returnDate: "12 มิ.ย. 2567",
  totalDays: "3",
  companions: [{ name: "นางสาวสมหญิง รักงาน", position: "นายช่างชลประทาน" }],
  replacementName: "นายขยัน เรียนรู้",
  replacementPosition: "วิศวกรชลประทาน",
  vehicleNo: "ชป 1234",
  requesterName: "นายสมชาย ใจดี",
  requesterPosition: "วิศวกรชลประทาน",
  approverName: "ผู้อำนวยการสำนักงานชลประทานที่ 4",
  approverPosition: "ผส.ชป.4",
  approveDate: "5 มิ.ย. 2567",
};
