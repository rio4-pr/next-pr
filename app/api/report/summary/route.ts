import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCategories } from "@/lib/services/categories";

export async function GET() {
    try {
        // =====================
        // 1. categories (NO FETCH)
        // =====================
        const categories = await getCategories();

        // =====================
        // 2. summary
        // =====================
        const summary = await prisma.news_daily_summary.findMany();

        const summaryMap: Record<string, number> = {};

        categories.forEach((c) => {
            summaryMap[c.key] = 0;
        });

        summary.forEach((row) => {
            const catKey = categories.find(
                (c) => c.id === row.category_id
            )?.key;

            if (!catKey) return;

            summaryMap[catKey] += row.total_news ?? 0;
        });

        const total = Object.values(summaryMap).reduce(
            (a, b) => a + (b || 0),
            0
        );

        const summaryRows = [
            {
                office: "สรุปทั้งหมด",
                ...summaryMap,
                total,
            },
        ];

        // =====================
        // 3. news
        // =====================
        const newsItems = await prisma.news_items.findMany({
            include: {
                news_categories: true,
                news_sources: true,
            },
            orderBy: { news_date: "desc" },
        });

        const newsRows = newsItems.map((n) => ({
            id: Number(n.news_id),
            date: n.news_date.toISOString(),
            title: n.news_title,
            source: n.news_sources?.source_name ?? "-",
            category: n.news_categories?.category_name ?? "-",
        }));

        return NextResponse.json({
            title: "รายงานข่าวสำนักงานชลประทานที่ 4",
            categories,
            summaryRows,
            summaryTotals: summaryRows[0],
            newsRows,
        });
    } catch (err) {
        console.error(err);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
