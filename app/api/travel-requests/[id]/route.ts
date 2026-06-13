import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/travel-requests/[id]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const travelReq = await prisma.travel_requests.findUnique({
            where: { request_id: id },
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
                expense_claims: {
                    select: {
                        claim_id: true,
                        claim_number: true,
                        total_amount: true,
                        status: true,
                    },
                },
                vehicle_requests: {
                    select: {
                        vreq_id: true,
                        doc_number: true,
                        status: true,
                    },
                },
            },
        });

        if (!travelReq) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(travelReq);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// PUT /api/travel-requests/[id]
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();

        const departDate = body.depart_date ? new Date(body.depart_date) : undefined;
        const returnDate = body.return_date ? new Date(body.return_date) : undefined;
        let travelDays: number | undefined;
        if (departDate && returnDate) {
            travelDays = Math.ceil(
                (returnDate.getTime() - departDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
        }

        const updated = await prisma.travel_requests.update({
            where: { request_id: id },
            data: {
                purpose: body.purpose,
                destination: body.destination,
                depart_date: departDate,
                return_date: returnDate,
                travel_days: travelDays,
                transport_type: body.transport_type ?? undefined,
                status: body.status,
                budget_code: body.budget_code ?? undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE /api/travel-requests/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // ลบข้อมูลที่เกี่ยวข้องก่อน
        await prisma.travel_approvals.deleteMany({ where: { request_id: id } });
        await prisma.travel_participants.deleteMany({ where: { request_id: id } });

        await prisma.travel_requests.delete({ where: { request_id: id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
