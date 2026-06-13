import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/users - ดึงรายชื่อผู้ใช้ทั้งหมด
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const isActive = searchParams.get("is_active");

        const where: Record<string, unknown> = {};
        if (isActive !== null) {
            where.is_active = isActive === "true";
        } else {
            where.is_active = true; // default: เฉพาะผู้ใช้ที่ active
        }

        const data = await prisma.users.findMany({
            where,
            select: {
                user_id: true,
                employee_code: true,
                full_name: true,
                position: true,
                department: true,
                level: true,
                email: true,
                phone: true,
                is_active: true,
            },
            orderBy: { full_name: "asc" },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
