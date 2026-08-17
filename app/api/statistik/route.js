import { NextResponse } from "next/server";
import { getStatistik } from "@/lib/data";

export async function GET() {
  try {
    const stats = getStatistik();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
