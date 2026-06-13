import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/expense-claims/[id]
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const claim = await prisma.expense_claims.findUnique({
            where: { claim_id: id },
            include: {
                users: {
                    select: {
                        user_id: true,
                        full_name: true,
                        position: true,
                        department: true,
                    },
                },
                expense_categories: true,
                budget_allocations: true,
                expense_items: true,
                expense_approvals: {
                    include: {
                        users: {
                            select: { full_name: true, position: true },
                        },
                    },
                    orderBy: { approval_step: "asc" },
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

        if (!claim) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(claim);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// PUT /api/expense-claims/[id]
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();

        const updated = await prisma.expense_claims.update({
            where: { claim_id: id },
            data: {
                cat_id: body.cat_id ?? undefined,
                budget_id: body.budget_id ?? undefined,
                claim_date: body.claim_date ? new Date(body.claim_date) : undefined,
                total_amount: body.total_amount,
                description: body.description ?? undefined,
                status: body.status,
                paid_at: body.paid_at ? new Date(body.paid_at) : undefined,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// DELETE /api/expense-claims/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        // ลบข้อมูลที่เกี่ยวข้องก่อน
        await prisma.expense_approvals.deleteMany({ where: { claim_id: id } });
        await prisma.expense_items.deleteMany({ where: { claim_id: id } });
        await prisma.expense_claims.delete({ where: { claim_id: id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
