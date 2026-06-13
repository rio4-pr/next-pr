import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/news - ดึงรายการข่าวทั้งหมด
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sortColumns = [
            {
                key: "id",
                column_name: "news_id",
                column_label: "ลำดับ",
            },
            {
                key: "date",
                column_name: "news_date",
                column_label: "วันที่/เวลา",
            },
            {
                key: "title",
                column_name: "news_title",
                column_label: "หัวข้อข่าว",
            },
            {
                key: "source",
                column_name: "source_name",
                column_label: "แหล่งข่าว",
            },
        ];
        
        const categoryId = searchParams.get("category_id");
        const sourceId = searchParams.get("source_id");
        const sentiment = searchParams.get("sentiment");
        const isHighlighted = searchParams.get("is_highlighted");
        const keyword = searchParams.get("keyword");
        const limit = searchParams.get("limit");

        const where: Record<string, unknown> = {};

        if (categoryId) where.category_id = parseInt(categoryId);
        if (sourceId) where.source_id = parseInt(sourceId);
        if (sentiment) where.sentiment = sentiment;
        if (isHighlighted !== null) where.is_highlighted = isHighlighted === "1" || isHighlighted === "true";
        if (keyword) {
            where.OR = [
                { news_title: { contains: keyword } },
                { news_summary: { contains: keyword } },
            ];
        }

        const data = await prisma.news_items.findMany({
            where,
            include: {
                news_categories: true,
                news_sources: true,
            },
            orderBy: { news_date: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json({
            rows: JSON.parse(
                JSON.stringify(data, (_, value) =>
                    typeof value === "bigint"
                        ? value.toString()
                        : value
                )
            ),
            sortColumns,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST /api/news - สร้างข่าวใหม่
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const news = await prisma.news_items.create({
            data: {
                category_id: body.category_id,
                source_id: body.source_id,
                news_title: body.news_title,
                news_summary: body.news_summary ?? null,
                news_url: body.news_url ?? null,
                news_date: body.news_date ? new Date(body.news_date) : new Date(),
                sentiment: body.sentiment ?? "neutral",
                is_highlighted: body.is_highlighted ?? false,
                created_by: body.created_by ?? null,
                created_at: new Date(),
            },
        });

        return NextResponse.json(
            JSON.parse(
                JSON.stringify(news, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            ),
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
