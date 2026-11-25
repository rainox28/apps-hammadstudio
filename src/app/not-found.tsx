import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F5F7F6] px-4">
      <div className="max-w-md w-full rounded-2xl border border-[#E4EAE6] bg-white p-8 text-center">
        <p className="text-xs font-mono font-semibold text-[#017A56]">404</p>
        <h1 className="text-2xl font-bold text-[#141917] mt-1">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-[#49544E] mt-2">
          Aplikasi atau halaman yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          href="/"
          className="mt-6 min-h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
