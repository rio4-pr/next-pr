import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/vehicle-requests/[id]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const vreq = await prisma.vehicle_requests.findUnique({
            where: { vreq_id: id },
            include: {
                users: {
                    select: {
                        user_id: true,
                        full_name: true,
                        position: true,
                        department: true,
                        phone: true,
                    },
                },
                vehicle_assignments: {
                    include: {
                        vehicles: true,
                        drivers: {
                            include: {
                                users: {
                                    select: { full_name: true, position: true },
                                },
                            },
                        },
                    },
                },
                travel_requests: {
                    select: {
                        request_id: true,
                        doc_number: true,
                        purpose: true,
                        destination: true,
                    },
                },
            },
        });

        if (!vreq) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(vreq);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// PUT /api/vehicle-requests/[id]
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();

        const updated = await prisma.vehicle_requests.update({
            where: { vreq_id: id },
            data: {
                purpose: body.purpose,
                destination: body.destination,
                start_datetime: body.start_datetime ? new Date(body.start_datetime) : undefined,
                end_datetime: body.end_datetime ? new Date(body.end_datetime) : undefined,
                passenger_count: body.passenger_count,
                status: body.status,
                travel_request_id: body.travel_request_id ?? null,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE /api/vehicle-requests/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // ลบ vehicle_assignments ที่เกี่ยวข้องก่อน
        await prisma.vehicle_assignments.deleteMany({
            where: { vreq_id: id },
        });

        await prisma.vehicle_requests.delete({ where: { vreq_id: id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
