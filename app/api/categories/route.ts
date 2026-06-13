import { NextResponse } from "next/server";
import { getCategories } from "@/lib/services/categories";

export async function GET() {
    return NextResponse.json(await getCategories());
}
