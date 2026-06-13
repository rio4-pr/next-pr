import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/expense-categories - ดึงหมวดหมู่ค่าใช้จ่ายทั้งหมด
export async function GET() {
    try {
        const data = await prisma.expense_categories.findMany({
            orderBy: { cat_id: "asc" },
        });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
