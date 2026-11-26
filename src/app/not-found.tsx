import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full rounded-2xl border border-line bg-white p-8 text-center">
        <p className="text-sm text-ink-3 tabular-nums">404</p>
        <h1 className="text-2xl font-semibold text-ink mt-1">
          Halaman tidak ditemukan
        </h1>
        <p className="text-sm text-ink-2 mt-2">
          Aplikasi atau halaman ini tidak tersedia, atau belum dipublikasikan.
        </p>
        <Link
          href="/"
          className="mt-6 min-h-11 px-5 inline-flex items-center justify-center rounded-[10px] bg-accent text-white text-sm font-semibold hover:bg-accent-hover"
        >
          Kembali ke katalog
        </Link>
      </div>
    </div>
  );
}
