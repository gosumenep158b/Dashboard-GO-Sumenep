import { NextResponse } from "next/server";
import { getSiswa } from "@/lib/data";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const tingkat = searchParams.get("tingkat") || "";
    const sekolah = searchParams.get("sekolah") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let data = getSiswa();

    if (q) {
      data = data.filter(
        (s) =>
          (s.nama_siswa || "").toLowerCase().includes(q) ||
          (s.no_reg || "").toLowerCase().includes(q) ||
          (s.nama_ortu || "").toLowerCase().includes(q) ||
          (s.asal_sekolah || "").toLowerCase().includes(q) ||
          (s.kelas_go || "").toLowerCase().includes(q)
      );
    }

    if (tingkat) {
      data = data.filter((s) => (s.tingkat_kelas || "") === tingkat);
    }

    if (sekolah) {
      data = data.filter((s) => (s.asal_sekolah || "") === sekolah);
    }

    const total = data.length;
    const start = (page - 1) * limit;
    const paged = data.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: paged,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}
