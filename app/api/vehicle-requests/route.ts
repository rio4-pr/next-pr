import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/vehicle-requests - ดึงรายการคำขอยานพาหนะทั้งหมด
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
                "อยู่ระหว่างตรวจสอบ": "assigned",
                "รออนุมัติ": "pending",
                "ไม่อนุมัติ": "cancelled",
                "เสร็จสิ้น": "completed",
            };
            if (statusMap[status]) {
                where.status = statusMap[status];
            }
        }

        if (startDate && endDate) {
            where.start_datetime = {
                gte: new Date(startDate),
                lte: new Date(endDate + "T23:59:59"),
            };
        }

        if (keyword) {
            where.OR = [
                { purpose: { contains: keyword } },
                { destination: { contains: keyword } },
                { doc_number: { contains: keyword } },
            ];
        }

        const data = await prisma.vehicle_requests.findMany({
            where,
            include: {
                users: {
                    select: {
                        user_id: true,
                        full_name: true,
                        position: true,
                        department: true,
                    },
                },
                vehicle_assignments: {
                    include: {
                        vehicles: {
                            select: {
                                vehicle_id: true,
                                plate_number: true,
                                brand: true,
                                model: true,
                                vehicle_type: true,
                            },
                        },
                        drivers: {
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
                },
            },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// POST /api/vehicle-requests - สร้างคำขอยานพาหนะใหม่
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // สร้างเลขที่เอกสารอัตโนมัติ
        const year = new Date().getFullYear() + 543;
        const count = await prisma.vehicle_requests.count();
        const docNumber = `บ3-${year}-${String(count + 1).padStart(4, "0")}`;

        const vreq = await prisma.vehicle_requests.create({
            data: {
                doc_number: docNumber,
                requester_id: body.requester_id,
                travel_request_id: body.travel_request_id ?? null,
                purpose: body.purpose,
                destination: body.destination,
                start_datetime: new Date(body.start_datetime),
                end_datetime: new Date(body.end_datetime),
                passenger_count: body.passenger_count ?? 1,
                status: "pending",
            },
            include: {
                users: {
                    select: {
                        full_name: true,
                        position: true,
                        department: true,
                    },
                },
            },
        });

        return NextResponse.json(vreq, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
