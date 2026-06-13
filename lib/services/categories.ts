import { prisma } from "@/lib/prisma";

export async function getCategories() {
    const data = await prisma.news_categories.findMany({
        where: { is_active: true },
        orderBy: { category_id: "asc" },
        select: {
            category_id: true,
            category_name: true,
            category_code: true,
        },
    });

    return data.map((c) => ({
        id: c.category_id,
        label: c.category_name,
        key: c.category_code ?? `cat_${c.category_id}`,
    }));
}
