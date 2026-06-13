import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = BigInt(idStr);
        const news = await prisma.news_items.findUnique({
            where: { news_id: id },
            include: {
                news_categories: true,
                news_sources: true,
            },
        });

        if (!news) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(
            JSON.parse(
                JSON.stringify(news, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            )
        );
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = BigInt(idStr);
        const body = await req.json();

        const updated = await prisma.news_items.update({
            where: { news_id: id },
            data: {
                category_id: body.category_id,
                source_id: body.source_id,
                news_title: body.news_title,
                news_summary: body.news_summary,
                news_url: body.news_url,
                news_date: body.news_date ? new Date(body.news_date) : undefined,
                sentiment: body.sentiment,
                is_highlighted: body.is_highlighted,
            },
        });

        return NextResponse.json(
            JSON.parse(
                JSON.stringify(updated, (_, value) =>
                    typeof value === "bigint" ? value.toString() : value
                )
            )
        );
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = BigInt(idStr);
        await prisma.news_items.delete({ where: { news_id: id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
