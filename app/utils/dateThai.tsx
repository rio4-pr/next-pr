// 📁 utils/dateThai.ts

// ==========================
// 🔹 Parse ISO → Date (ปลอดภัย)
// ==========================
export function toDate(str: string | null | undefined): Date | null {
    if (!str) return null;

    const parts = str.split("-");
    if (parts.length !== 3) return null;

    const [y, m, d] = parts.map(Number);

    if (!y || !m || !d) return null;

    const date = new Date(y, m - 1, d);

    // ✅ ป้องกัน invalid date เช่น 2026-02-31
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
        return null;
    }

    return date;
}

// ==========================
// 🔹 Date → ISO (YYYY-MM-DD)
// ==========================
export function toISO(date: Date | null): string {
    if (!date) return "";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

// ==========================
// 🔹 format ไทย (เลขล้วน)
// 21/05/2569
// ==========================
export function formatThai(date: Date | null) {
    if (!date) return "";

    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear() + 543;

    return `${d}/${m}/${y}`;
}

// ==========================
// 🔹 format ไทยเต็ม (PDF / UI)
// 21 พฤษภาคม 2569
// ==========================
export function formatThaiFull(date: Date | null) {
    if (!date) return "";

    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
}

// ==========================
// 🔹 วันนี้ (ISO)
// ==========================
export function todayISO() {
    return toISO(new Date());
}

// ==========================
// 🔹 ใช้ filter ช่วงวันที่
// ==========================
export function isInRange(
    dateStr: string,
    startStr: string,
    endStr: string
) {
    const date = toDate(dateStr);
    const start = toDate(startStr);
    const end = toDate(endStr);

    if (!date || !start || !end) return true;

    return date >= start && date <= end;
}