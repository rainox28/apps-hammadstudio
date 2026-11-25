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
    <div className="min-h-dvh flex items-center justify-center bg-[#F5F7F6] px-4">
      <div className="max-w-md w-full rounded-2xl border border-[#E4EAE6] bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-[#141917]">
          Terjadi kendala memuat halaman
        </h1>
        <p className="text-sm text-[#49544E] mt-2">
          {error.message || "Gagal mengambil data dari server. Coba muat ulang."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="min-h-11 px-5 rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
          >
            Muat Ulang
          </button>
          <Link
            href="/"
            className="min-h-11 px-4 inline-flex items-center rounded-xl border border-[#C8D3CC] text-sm font-semibold text-[#141917]"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
