"use client";

import React from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full rounded-2xl border border-line bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-ink">
          Terjadi kendala memuat halaman
        </h1>
        <p className="text-sm text-ink-2 mt-2">
          {error.message || "Gagal mengambil data dari server. Coba muat ulang."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 px-5 rounded-[10px] bg-accent text-white text-sm font-semibold hover:bg-accent-hover"
          >
            Muat ulang
          </button>
          <Link
            href="/"
            className="min-h-11 px-4 inline-flex items-center rounded-[10px] border border-line-strong text-sm font-semibold text-ink"
          >
            Ke katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
