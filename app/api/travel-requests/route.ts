import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/travel-requests - ดึงรายการคำขอเดินทางทั้งหมด
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const keyword = searchParams.get("keyword");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const where: Record<string, unknown> = {};

        if (status && status !== "ทั้งหมด") {
            const statusMap: Record<string, string> = {
                "อนุมัติแล้ว": "approved",
                "อยู่ระหว่างตรวจสอบ": "submitted",
                "รออนุมัติ": "draft",
                "ไม่อนุมัติ": "rejected",
            };
            if (statusMap[status]) {
                where.status = statusMap[status];
            }
        }

        if (startDate && endDate) {
            where.depart_date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        if (keyword) {
            where.OR = [
                { purpose: { contains: keyword } },
                { destination: { contains: keyword } },
                { doc_number: { contains: keyword } },
            ];
        }

        const data = await prisma.travel_requests.findMany({
            where,
            include: {
                travel_participants: {
                    include: {
                        users: {
                            select: {
                                user_id: true,
                                full_name: true,
                                position: true,
                                department: true,
                            },
                        },
                    },
                },
                travel_approvals: {
                    include: {
                        users: {
                            select: {
                                full_name: true,
                                position: true,
                            },
                        },
                    },
                    orderBy: { approval_step: "asc" },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST /api/travel-requests - สร้างคำขอเดินทางใหม่
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // สร้างเลขที่เอกสารอัตโนมัติ
        const year = new Date().getFullYear() + 543;
        const count = await prisma.travel_requests.count();
        const docNumber = `ชป318-${year}-${String(count + 1).padStart(4, "0")}`;

        // คำนวณจำนวนวันเดินทาง
        const departDate = new Date(body.depart_date);
        const returnDate = new Date(body.return_date);
        const travelDays = Math.ceil(
            (returnDate.getTime() - departDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        const travelReq = await prisma.travel_requests.create({
            data: {
                doc_number: docNumber,
                requester_id: body.requester_id,
                purpose: body.purpose,
                destination: body.destination,
                depart_date: departDate,
                return_date: returnDate,
                travel_days: travelDays,
                transport_type: body.transport_type ?? null,
                status: "draft",
                budget_code: body.budget_code ?? null,
                // สร้าง participants พร้อมกัน
                travel_participants: body.participants?.length
                    ? {
                        create: body.participants.map((p: { user_id: number; role?: string; remark?: string }) => ({
                            user_id: p.user_id,
                            role: p.role ?? "member",
                            remark: p.remark ?? null,
                        })),
                    }
                    : undefined,
            },
            include: {
                travel_participants: {
                    include: {
                        users: {
                            select: {
                                full_name: true,
                                position: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(travelReq, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
