import { NextResponse } from "next/server";
import { getUlangTahun } from "@/lib/data";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get("bulan");
    const result = getUlangTahun(bulan);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data ulang tahun" },
      { status: 500 }
    );
  }
}
