import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/expense-claims - ดึงรายการใบเบิกค่าใช้จ่ายทั้งหมด
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const fiscalYear = searchParams.get("fiscal_year");
        const claimantId = searchParams.get("claimant_id");

        const where: Record<string, unknown> = {};

        if (status && status !== "ทั้งหมด") {
            const statusMap: Record<string, string> = {
                "อนุมัติแล้ว": "approved",
                "รอตรวจสอบ": "submitted",
                "ร่าง": "draft",
                "จ่ายแล้ว": "paid",
                "ไม่อนุมัติ": "rejected",
            };
            if (statusMap[status]) {
                where.status = statusMap[status];
            }
        }

        if (fiscalYear) {
            const year = parseInt(fiscalYear) - 543; // แปลง พ.ศ. เป็น ค.ศ.
            where.claim_date = {
                gte: new Date(`${year - 1}-10-01`),
                lte: new Date(`${year}-09-30`),
            };
        }

        if (claimantId) {
            where.claimant_id = parseInt(claimantId);
        }

        const data = await prisma.expense_claims.findMany({
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
                expense_categories: {
                    select: {
                        cat_id: true,
                        cat_name: true,
                        cat_code: true,
                    },
                },
                budget_allocations: {
                    select: {
                        budget_id: true,
                        budget_code: true,
                        allocated_amount: true,
                        used_amount: true,
                    },
                },
                expense_items: true,
                expense_approvals: {
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

// POST /api/expense-claims - สร้างใบเบิกค่าใช้จ่ายใหม่
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // สร้างเลขที่ใบเบิกอัตโนมัติ
        const year = new Date().getFullYear();
        const count = await prisma.expense_claims.count();
        const claimNumber = `CLM-${year}-${String(count + 1).padStart(3, "0")}`;

        // คำนวณยอดรวมจาก items
        const totalAmount = body.items?.reduce(
            (sum: number, item: { amount: number; quantity?: number }) =>
                sum + item.amount * (item.quantity ?? 1),
            0
        ) ?? 0;

        const claim = await prisma.expense_claims.create({
            data: {
                claim_number: claimNumber,
                claimant_id: body.claimant_id,
                cat_id: body.cat_id ?? null,
                budget_id: body.budget_id ?? null,
                travel_request_id: body.travel_request_id ?? null,
                claim_date: new Date(body.claim_date),
                total_amount: totalAmount,
                description: body.description ?? null,
                status: "draft",
                // สร้าง expense_items พร้อมกัน
                expense_items: body.items?.length
                    ? {
                        create: body.items.map((item: {
                            item_name: string;
                            item_date?: string;
                            amount: number;
                            unit?: string;
                            quantity?: number;
                            receipt_number?: string;
                            receipt_file?: string;
                        }) => ({
                            item_name: item.item_name,
                            item_date: item.item_date ? new Date(item.item_date) : null,
                            amount: item.amount,
                            unit: item.unit ?? null,
                            quantity: item.quantity ?? 1,
                            receipt_number: item.receipt_number ?? null,
                            receipt_file: item.receipt_file ?? null,
                        })),
                    }
                    : undefined,
            },
            include: {
                expense_items: true,
                expense_categories: {
                    select: { cat_name: true, cat_code: true },
                },
            },
        });

        return NextResponse.json(claim, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
