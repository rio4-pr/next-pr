// utils/newsClassifier.ts

export const CATEGORY_KEYWORDS = {
    royal: [
        "พระราชดำริ",
        "พระราชเสาวนีย์",
        "พระราชกระแส",
        "โครงการอันเนื่องมาจากพระราชดำริ",
        "ศูนย์ศึกษาการพัฒนา",
        "เศรษฐกิจพอเพียง",
        "เกษตรทฤษฎีใหม่",
        "เฉลิมพระเกียรติ",
        "ถวายพระพร",
        "สนองพระราชดำริ",
    ],

    waterManagement: [
        "อุทกภัย",
        "น้ำท่วม",
        "น้ำหลาก",
        "ภัยแล้ง",
        "บริหารจัดการน้ำ",
        "ระบายน้ำ",
        "สูบน้ำ",
        "เครื่องสูบน้ำ",
        "คันกั้นน้ำ",
        "แก้มลิง",
        "ป้องกันน้ำท่วม",
        "เตือนภัย",
        "ศูนย์บัญชาการน้ำ",
        "เฝ้าระวังน้ำ",
        "บรรเทาภัย",
        "ฟื้นฟูหลังน้ำท่วม",
        "แจกจ่ายน้ำ",
    ],

    waterDevelopment: [
        "ก่อสร้าง",
        "ปรับปรุง",
        "ซ่อมแซม",
        "แหล่งน้ำ",
        "อ่างเก็บน้ำ",
        "ฝาย",
        "คลองส่งน้ำ",
        "คลองระบายน้ำ",
        "ระบบชลประทาน",
        "พื้นที่ชลประทาน",
        "ขยายเขตชลประทาน",
        "พัฒนาแหล่งน้ำ",
        "ขุดลอก",
        "ประตูระบายน้ำ",
        "สถานีสูบน้ำ",
        "เพิ่มประสิทธิภาพ",
        "โครงสร้างพื้นฐาน",
    ],
} as const;

export const CATEGORY_NAMES = {
    royal: "โครงการเนื่องในพระราชดำริ",
    waterManagement: "ด้านบริหารจัดการน้ำ บรรเทาภัยอันเกิดจากน้ำ",
    waterDevelopment: "ด้านพัฒนาแหล่งน้ำและเพิ่มพื้นที่ชลประทาน",
    organization: "ด้านการสร้างภาพลักษณ์องค์กร และอื่นๆ",
} as const;

export interface ClassificationResult {
    category: string;
    scores: {
        royal: number;
        waterManagement: number;
        waterDevelopment: number;
    };
}

export function classifyNews(
    title: string,
    content: string = ""
): ClassificationResult {
    const text = `${title} ${content}`.toLowerCase();

    const scores = {
        royal: 0,
        waterManagement: 0,
        waterDevelopment: 0,
    };

    // นับคะแนนแต่ละหมวด
    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
        keywords.forEach((keyword) => {
            const matches = text.match(
                new RegExp(
                    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    "gi"
                )
            );

            if (matches) {
                scores[category as keyof typeof scores] += matches.length;
            }
        });
    });

    const maxScore = Math.max(
        scores.royal,
        scores.waterManagement,
        scores.waterDevelopment
    );

    // ไม่พบคีย์เวิร์ดเลย -> หมวด 4
    if (maxScore === 0) {
        return {
            category: CATEGORY_NAMES.organization,
            scores,
        };
    }

    const bestCategory = Object.entries(scores).sort(
        (a, b) => b[1] - a[1]
    )[0][0] as keyof typeof scores;

    return {
        category: CATEGORY_NAMES[bestCategory],
        scores,
    };
}
