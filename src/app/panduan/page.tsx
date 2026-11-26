import React, { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const dynamic = "force-dynamic";

export default async function InstallGuidePage() {
  const session = await getSession();

  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-[#dce3da] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="site-wrap flex-1 py-8">
        <div className="max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center min-h-11 text-sm font-bold text-[#006c4c] hover:underline"
          >
            Kembali ke Katalog
          </Link>

          <div className="mt-3 rounded-[22px] border border-[#dce3da] bg-white p-6 sm:p-8">
            <span className="w-12 h-12 rounded-[14px] bg-[#deebd5] text-[#2d6848] grid place-items-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="6.3" y="2.5" width="11.4" height="19" rx="2.7" />
                <path d="M10.5 5h3m-2.1 13.7h1.2" />
              </svg>
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18221c] tracking-[-0.04em]">
              Pasang APK di Android
            </h1>
            <p className="text-sm sm:text-base text-[#52625a] mt-2 leading-relaxed">
              Ikuti langkah berikut untuk memasang build prarilis resmi dari Studio Apps sebelum dipublikasikan ke Google Play Store.
            </p>

            <ol className="mt-6 space-y-4">
              <li className="grid grid-cols-[30px_1fr] gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-[#e9f1e4] text-[#275136] text-xs font-extrabold grid place-items-center mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-sm sm:text-base font-bold text-[#18221c]">
                    Unduh APK di HP
                  </strong>
                  <p className="text-sm text-[#4b5d52] mt-1">
                    Buka halaman aplikasi, cek versinya, lalu ketuk Unduh APK. Jika membuka dari komputer, gunakan fitur Scan QR di HP.
                  </p>
                </div>
              </li>

              <li className="grid grid-cols-[30px_1fr] gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-[#e9f1e4] text-[#275136] text-xs font-extrabold grid place-items-center mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-sm sm:text-base font-bold text-[#18221c]">
                    Buka file unduhan
                  </strong>
                  <p className="text-sm text-[#4b5d52] mt-1">
                    Ketuk notifikasi unduhan, atau cari file berakhiran .apk di folder Unduhan perangkat Android kamu.
                  </p>
                </div>
              </li>

              <li className="grid grid-cols-[30px_1fr] gap-3 items-start">
                <span className="w-7 h-7 rounded-lg bg-[#e9f1e4] text-[#275136] text-xs font-extrabold grid place-items-center mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-sm sm:text-base font-bold text-[#18221c]">
                    Ikuti petunjuk pemasangan
                  </strong>
                  <p className="text-sm text-[#4b5d52] mt-1">
                    Aktifkan izin sumber tidak dikenal jika diminta Android, periksa nama aplikasi dan sumber file, lalu pilih Instal dan Buka setelah selesai.
                  </p>
                </div>
              </li>
            </ol>

            <a
              href="https://support.google.com/android/answer/9457058?hl=id"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#006c4c] underline underline-offset-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 6.4C9.5 4.6 6.6 4.2 3 5.1v13.6c3.8-.9 6.8-.3 9 1.3 2.2-1.6 5.2-2.2 9-1.3V5.1c-3.6-.9-6.5-.5-9 1.3zm0 0V20" />
              </svg>
              <span>Panduan resmi Android</span>
            </a>
          </div>
        </div>
      </main>

      <StoreFooter />

      <Suspense fallback={null}>
        <MobileBottomNav isAuthenticated={Boolean(session)} />
      </Suspense>
    </>
  );
}
