import "./globals.css";

export const metadata = {
  title: "Dashboard GO Sumenep | TA 2026/2027",
  description: "Dashboard data siswa GO (Bimbingan Belajar) Kabupaten Sumenep",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
