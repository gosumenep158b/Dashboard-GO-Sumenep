import fs from "fs";
import path from "path";
import { parseISO, format, isSameDay, getMonth, getDate } from "date-fns";
import { id as localeId } from "date-fns/locale/id";

const dataPath = path.join(process.cwd(), "data", "siswa.json");

export function getSiswa() {
  try {
    const raw = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading siswa.json:", e);
    return [];
  }
}

export function getStatistik() {
  const siswa = getSiswa();
  const total = siswa.length;

  const byTingkat = {};
  const bySekolah = {};
  const byKelasGo = {};
  const byBulanDaftar = {};
  let laki = 0;
  let perempuan = 0;

  const malePrefixes = ["M.", "MOH.", "MUHAMMAD", "AHMAD", "ACH.", "R.", "RB."];

  siswa.forEach((s) => {
    const tingkat = s.tingkat_kelas || "Lainnya";
    byTingkat[tingkat] = (byTingkat[tingkat] || 0) + 1;

    const sekolah = s.asal_sekolah || "Tidak diketahui";
    bySekolah[sekolah] = (bySekolah[sekolah] || 0) + 1;

    const kelas = s.kelas_go || "Lainnya";
    byKelasGo[kelas] = (byKelasGo[kelas] || 0) + 1;

    if (s.tgl_daftar) {
      try {
        const d = parseISO(s.tgl_daftar);
        const key = format(d, "yyyy-MM");
        byBulanDaftar[key] = (byBulanDaftar[key] || 0) + 1;
      } catch {}
    }

    const nama = (s.nama_siswa || "").toUpperCase();
    if (
      nama.includes("PUTRI") ||
      nama.startsWith("SITI") ||
      nama.startsWith("NUR ") ||
      /\b(A|I|YAH|TUL)\b/.test(nama)
    ) {
      perempuan++;
    } else if (
      malePrefixes.some((p) => nama.startsWith(p)) ||
      nama.startsWith("M ") ||
      nama.startsWith("M.")
    ) {
      laki++;
    } else {
      if (nama.endsWith("A") || nama.endsWith("I") || nama.endsWith("YAH")) {
        perempuan++;
      } else {
        laki++;
      }
    }
  });

  const topSekolah = Object.entries(bySekolah)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const tingkatOrder = [
    "4 SD DASAR", "5 SD DASAR", "6 SD DASAR",
    "7 SMP UMUM", "8 SMP UMUM", "9 SMP UMUM",
    "10 SMA UMUM", "11 SMA UMUM", "12 SMA UMUM", "12 SMA SNBT", "13 ALUMNI UMUM",
  ];
  const tingkatData = Object.entries(byTingkat)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const ia = tingkatOrder.indexOf(a.name);
      const ib = tingkatOrder.indexOf(b.name);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  const bulanData = Object.entries(byBulanDaftar)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([bulan, count]) => {
      try {
        const d = parseISO(bulan + "-01");
        return {
          bulan,
          label: format(d, "MMM yyyy", { locale: localeId }),
          count,
        };
      } catch {
        return { bulan, label: bulan, count };
      }
    });

  const kategori = { SD: 0, SMP: 0, SMA: 0, Alumni: 0, Lainnya: 0 };
  siswa.forEach((s) => {
    const t = (s.tingkat_kelas || "").toUpperCase();
    if (t.includes("SD")) kategori.SD++;
    else if (t.includes("SMP")) kategori.SMP++;
    else if (t.includes("SMA") || t.includes("SNBT")) kategori.SMA++;
    else if (t.includes("ALUMNI")) kategori.Alumni++;
    else kategori.Lainnya++;
  });

  return {
    total,
    byTingkat: tingkatData,
    topSekolah,
    byKelasGo: Object.entries(byKelasGo)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    byBulanDaftar: bulanData,
    kategori: Object.entries(kategori)
      .filter(([, c]) => c > 0)
      .map(([name, count]) => ({ name, count })),
    gender: { laki, perempuan },
  };
}

export function getUlangTahun(bulan = null) {
  const siswa = getSiswa();
  const now = new Date();
  const targetMonth = bulan !== null ? parseInt(bulan, 10) : now.getMonth() + 1;

  const hasil = siswa
    .filter((s) => {
      if (!s.tgl_lahir) return false;
      try {
        const d = parseISO(s.tgl_lahir);
        return getMonth(d) + 1 === targetMonth;
      } catch {
        return false;
      }
    })
    .map((s) => {
      const d = parseISO(s.tgl_lahir);
      const today = new Date();
      const thisYearBday = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      let umur = today.getFullYear() - d.getFullYear();
      if (
        today.getMonth() < d.getMonth() ||
        (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
      ) {
        umur--;
      }
      return {
        ...s,
        tanggal_lahir_formatted: format(d, "d MMMM", { locale: localeId }),
        hari: getDate(d),
        umur,
        isToday: isSameDay(thisYearBday, today),
      };
    })
    .sort((a, b) => a.hari - b.hari);

  return {
    bulan: targetMonth,
    labelBulan: format(new Date(2024, targetMonth - 1, 1), "MMMM", {
      locale: localeId,
    }),
    total: hasil.length,
    data: hasil,
  };
}
