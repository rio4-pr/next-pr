import { prisma } from "@/lib/prisma";

export async function GET() {
    const categories = await prisma.news_categories.findMany({
        where: { is_active: true },
    });

    const sources = await prisma.news_sources.findMany();

    const items = await prisma.news_items.findMany({
        select: {
            source_id: true,
            category_id: true,
        },
    });

    const summaryRows = sources.map((source) => {
        const row: any = {
            office: source.source_name,
            total: 0,
        };

        categories.forEach((cat) => {
            const count = items.filter(
                (i) =>
                    i.source_id === source.source_id &&
                    i.category_id === cat.category_id
            ).length;

            row[cat.category_code!] = count;
            row.total += count;
        });

        return row;
    });

    const totals: any = {};

    categories.forEach((cat) => {
        totals[cat.category_code!] = summaryRows.reduce(
            (sum, r) => sum + (r[cat.category_code!] || 0),
            0
        );
    });

    totals.total = summaryRows.reduce((s, r) => s + r.total, 0);

    return Response.json({
        summaryRows,
        totals,
        categories,
    });

}