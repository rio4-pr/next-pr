import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data =
    await prisma.news_sources.findMany({
      orderBy: {
        source_name: "asc",
      },
    });

  return NextResponse.json(data);
}
