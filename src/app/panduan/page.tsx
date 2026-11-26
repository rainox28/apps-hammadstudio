import React, { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "Izinkan dari browser",
    body: "Saat pertama kali memasang, Android meminta izin “Instal aplikasi tak dikenal” untuk browser yang kamu pakai. Aktifkan sekali saja.",
    hint: "Setelan › Aplikasi › Chrome › Instal aplikasi tak dikenal",
  },
  {
    title: "Unduh APK",
    body: "Buka halaman aplikasi di katalog, lalu ketuk Unduh APK. Kalau membuka dari komputer, pindai Kode QR-nya dengan kamera HP.",
    hint: "File tersimpan di folder Download",
  },
  {
    title: "Buka dan pasang",
    body: "Ketuk notifikasi unduhan atau buka file .apk dari folder Download, pastikan nama aplikasinya benar, lalu pilih Pasang.",
    hint: "Update berikutnya dipasang di atas versi lama, data tetap aman",
  },
] as const;

const FAQS = [
  {
    q: "Apakah APK di sini aman?",
    a: "Semua build diunggah langsung oleh Hammad Studio. Cocokkan checksum SHA-256 di halaman detail aplikasi kalau ingin memastikan file tidak berubah.",
  },
  {
    q: "Kenapa muncul peringatan Play Protect?",
    a: "Build prarilis belum terdaftar di Google Play, jadi Play Protect belum mengenalinya. Pilih “Tetap instal” untuk melanjutkan.",
  },
  {
    q: "Apa beda Siap, Beta, dan Segera?",
    a: "Siap berarti layak dipakai harian. Beta masih diuji dan mungkin ada bug. Segera berarti build-nya belum tersedia.",
  },
  {
    q: "Bagaimana kalau pemasangan gagal?",
    a: "Hapus versi lama kalau tanda tangannya berbeda, pastikan ruang penyimpanan cukup, lalu unduh ulang APK-nya.",
  },
] as const;

export default async function InstallGuidePage() {
  const session = await getSession();

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="site-wrap flex-1 pt-6 pb-16">
        <section className="overflow-hidden rounded-[20px] bg-night flex flex-col md:flex-row">
          <div className="md:flex-1 px-6 py-10 sm:px-11 sm:py-12 text-white">
            <h1 className="text-[2rem] sm:text-[2.5rem] leading-[1.12] font-extrabold tracking-[-0.02em]">
              Pasang APK dalam tiga langkah
            </h1>
            <p className="mt-3 max-w-[48ch] text-base sm:text-[17px] leading-relaxed text-night-ink">
              Build prarilis tidak lewat Google Play, jadi Android perlu izin sekali untuk memasangnya. Setelah itu, update berikutnya tinggal unduh.
            </p>
          </div>
          <div aria-hidden="true" className="md:flex-1 min-h-[260px] night-glow-bg flex items-center justify-center p-7">
            <div className="w-[180px] rounded-[26px] bg-white p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              <div className="rounded-[18px] bg-raised px-3.5 py-5 flex flex-col items-center gap-2.5 text-center text-ink">
                <img src="/brand-logo.png" alt="" width={52} height={52} className="w-[52px] h-[52px] rounded-[14px] object-cover" />
                <span className="text-[13px] font-bold">Studio Apps</span>
                <span className="text-[11px] text-ink-3">Ingin memasang aplikasi ini?</span>
                <span className="flex w-full gap-1.5 text-[11px]">
                  <span className="flex-1 py-2 font-semibold text-accent">Batal</span>
                  <span className="flex-1 py-2 rounded-full bg-accent text-white font-bold">Pasang</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, idx) => (
            <li key={step.title} className="rounded-[16px] border border-line p-6 flex flex-col gap-3.5">
              <span className="w-10 h-10 rounded-[12px] bg-accent-soft text-accent-ink text-[17px] font-extrabold grid place-items-center tabular-nums">
                {idx + 1}
              </span>
              <h2 className="text-lg font-bold">{step.title}</h2>
              <p className="text-sm leading-[1.65] text-ink-2">{step.body}</p>
              <p className="mt-auto rounded-[10px] bg-raised px-3 py-2.5 text-xs text-ink-3">{step.hint}</p>
            </li>
          ))}
        </ol>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
          <div>
            <h2 className="text-2xl font-bold">Pertanyaan umum</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-3">
              Masih bingung? Hubungi Hammad Studio lewat kontak proyekmu.
            </p>
            <Link
              href="/"
              className="mt-5 min-h-11 px-5 inline-flex items-center rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover tactile-press"
            >
              Kembali ke katalog
            </Link>
          </div>
          <div className="border-t border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b border-line py-4">
                <summary className="flex items-center justify-between gap-4 min-h-8 text-[15px] font-semibold list-none [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-ink-3 transition-transform group-open:rotate-180">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-2.5 text-sm leading-[1.65] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <StoreFooter />

      <Suspense fallback={null}>
        <MobileBottomNav isAuthenticated={Boolean(session)} />
      </Suspense>
    </>
  );
}
