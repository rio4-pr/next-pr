import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/vehicles - ดึงรายการยานพาหนะทั้งหมด
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const vehicleType = searchParams.get("vehicle_type");

        const where: Record<string, unknown> = {};

        if (status) {
            where.status = status;
        }

        if (vehicleType) {
            where.vehicle_type = vehicleType;
        }

        const data = await prisma.vehicles.findMany({
            where,
            orderBy: { plate_number: "asc" },
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
