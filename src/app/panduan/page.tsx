import React, { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";

export const dynamic = "force-dynamic";

export default async function InstallGuidePage() {
  const session = await getSession();

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-[#E4EAE6] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center min-h-11 text-sm font-semibold text-[#017A56] hover:underline"
        >
          Kembali ke Katalog
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#141917] mt-2 tracking-tight">
          Panduan Memasang File APK di Android
        </h1>
        <p className="text-sm sm:text-base text-[#49544E] mt-2 leading-relaxed">
          Aplikasi di platform ini adalah build prarilis resmi dari Hammad Studio yang didistribusikan sebelum publikasi di Google Play Store.
        </p>

        <div className="mt-7 space-y-4">
          <section className="rounded-2xl border border-[#E4EAE6] bg-white p-5">
            <h2 className="text-base font-bold text-[#141917]">
              1. Unduh file APK dari halaman aplikasi
            </h2>
            <p className="text-sm text-[#49544E] mt-1.5 leading-relaxed">
              Buka halaman detail aplikasi, lalu tekan tombol Unduh APK. Jika membuka dari komputer, gunakan tombol Scan QR di HP agar file langsung terunduh di perangkat Android.
            </p>
          </section>

          <section className="rounded-2xl border border-[#E4EAE6] bg-white p-5">
            <h2 className="text-base font-bold text-[#141917]">
              2. Izinkan pemasangan dari browser atau pengelola file
            </h2>
            <p className="text-sm text-[#49544E] mt-1.5 leading-relaxed">
              Saat membuka file .apk untuk pertama kali, Android akan meminta izin pemasangan aplikasi dari sumber ini (misalnya Chrome atau File Manager). Pilih Setelan, lalu aktifkan Izinkan dari sumber ini.
            </p>
          </section>

          <section className="rounded-2xl border border-[#E4EAE6] bg-white p-5">
            <h2 className="text-base font-bold text-[#141917]">
              3. Konfirmasi Google Play Protect jika muncul
            </h2>
            <p className="text-sm text-[#49544E] mt-1.5 leading-relaxed">
              Build tahap internal atau beta yang belum masuk Play Store kadang memicu dialog verifikasi Play Protect. Jika sumber file berasal dari katalog resmi apps.hammad.studio, pilih Tetap instal atau Detail lainnya lalu Instal tetap.
            </p>
          </section>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}
