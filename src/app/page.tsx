import React, { Suspense } from "react";
import Link from "next/link";
import { getPublishedApps } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { APP_CATEGORIES } from "@/lib/constants";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { AppIcon } from "@/components/AppIcon";
import { TrackBadge } from "@/components/TrackBadge";
import { AppShelfCard } from "@/components/AppShelfCard";
import { BrandLogo } from "@/components/BrandLogo";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const activeCategory = params.category?.trim() || "Semua";

  const [session, appsList] = await Promise.all([
    getSession(),
    getPublishedApps({ q, category: activeCategory }),
  ]);

  const showSpotlight = !q && activeCategory === "Semua" && appsList.length > 0;
  const spotlightApp = showSpotlight
    ? appsList.find((item) => item.isFeatured) ?? appsList[0]
    : null;
  const otherApps = spotlightApp
    ? appsList.filter((item) => item.id !== spotlightApp.id)
    : appsList;

  const categories = ["Semua", ...APP_CATEGORIES];

  function buildFilterHref(category: string) {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category !== "Semua") next.set("category", category);
    const str = next.toString();
    return str ? `/?${str}` : "/";
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-[#E2E8E5] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8E5]">
          <div className="flex items-center gap-3.5 min-w-0">
            <BrandLogo size={46} className="hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111815]">
                Katalog Aplikasi Android Prarilis
              </h1>
              <p className="text-sm text-[#48544E] mt-0.5">
                Build APK resmi proyek Hammad Studio untuk penguji dan klien sebelum rilis Google Play.
              </p>
            </div>
          </div>

          <Link
            href="/panduan"
            className="min-h-11 px-4 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] shrink-0 tactile-press"
          >
            Cara Pasang APK
          </Link>
        </div>

        <nav
          aria-label="Filter kategori aplikasi"
          className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <Link
                key={cat}
                href={buildFilterHref(cat)}
                className={`min-h-10 px-4 inline-flex items-center rounded-full text-sm font-semibold whitespace-nowrap border transition-colors tactile-press ${
                  isActive
                    ? "bg-[#E6F4EE] text-[#017A56] border-[#017A56]"
                    : "bg-white text-[#48544E] border-[#E2E8E5] hover:bg-[#F8FAF9] hover:text-[#111815]"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        {q && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F8FAF9] border border-[#E2E8E5] px-4 py-3">
            <p className="text-sm text-[#111815]">
              Hasil pencarian untuk <span className="font-bold">{q}</span> ({appsList.length} aplikasi)
            </p>
            <Link
              href={activeCategory !== "Semua" ? `/?category=${encodeURIComponent(activeCategory)}` : "/"}
              className="min-h-10 inline-flex items-center text-sm font-semibold text-[#017A56] hover:underline"
            >
              Hapus pencarian
            </Link>
          </div>
        )}

        {spotlightApp && (
          <section aria-labelledby="spotlight-heading" className="mb-10">
            <div className="rounded-3xl overflow-hidden border border-[#E2E8E5] bg-white play-card-elevation">
              {spotlightApp.bannerUrl ? (
                <div className="relative aspect-[21/9] max-h-[340px] w-full overflow-hidden bg-[#0D1513]">
                  <img
                    src={spotlightApp.bannerUrl}
                    alt={`Banner unggulan ${spotlightApp.name}`}
                    width={1280}
                    height={548}
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1513]/75 via-[#0D1513]/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-center justify-between gap-2 text-white">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold border border-white/25">
                      Sorotan Utama · {spotlightApp.category}
                    </span>
                    {spotlightApp.latestRelease && (
                      <span className="text-xs font-mono text-[#A7E3CE]">
                        v{spotlightApp.latestRelease.versionName} · {spotlightApp.latestRelease.fileSizeLabel}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0D1513] text-white px-5 py-6 sm:px-8 sm:py-8 border-b border-[#1D2A26]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                      <AppIcon
                        name={spotlightApp.name}
                        iconUrl={spotlightApp.iconUrl}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#182823] border border-[#28423A] text-xs font-semibold text-[#A7E3CE]">
                            Sorotan Rilis
                          </span>
                          <span className="text-xs font-medium text-[#D1DBD6]">
                            {spotlightApp.category}
                          </span>
                        </div>
                        <h2
                          id="spotlight-heading"
                          className="text-xl sm:text-3xl font-bold text-white tracking-tight"
                        >
                          {spotlightApp.name}
                        </h2>
                        <p className="text-xs font-mono text-[#A7E3CE] mt-1 truncate">
                          {spotlightApp.packageName}
                        </p>
                        <p className="text-sm sm:text-base text-[#D1DBD6] mt-2.5 max-w-2xl leading-relaxed">
                          {spotlightApp.tagline}
                        </p>
                      </div>
                    </div>

                    {spotlightApp.screenshots.length > 0 && (
                      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
                        {spotlightApp.screenshots.slice(0, 3).map((src, i) => (
                          <Link
                            key={`${src}-${i}`}
                            href={`/apps/${spotlightApp.slug}`}
                            className="shrink-0 rounded-xl overflow-hidden border border-white/15 bg-[#182823]"
                          >
                            <img
                              src={src}
                              alt={`Pratinjau ${spotlightApp.name} ${i + 1}`}
                              width={108}
                              height={192}
                              fetchPriority={i === 0 ? "high" : "auto"}
                              className="h-36 sm:h-40 w-auto object-cover"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="px-5 py-4 sm:px-8 sm:py-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {spotlightApp.bannerUrl ? (
                  <div className="flex items-center gap-3.5 min-w-0">
                    <AppIcon
                      name={spotlightApp.name}
                      iconUrl={spotlightApp.iconUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h2
                        id="spotlight-heading"
                        className="text-lg sm:text-xl font-bold text-[#111815] truncate"
                      >
                        {spotlightApp.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#48544E] truncate">
                        {spotlightApp.developerName} · {spotlightApp.tagline}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#48544E] tabular-nums">
                    {spotlightApp.latestRelease && (
                      <TrackBadge track={spotlightApp.latestRelease.track} />
                    )}
                    <span>
                      Versi:{" "}
                      <strong className="text-[#111815]">
                        {spotlightApp.latestRelease
                          ? `v${spotlightApp.latestRelease.versionName}`
                          : "Belum dirilis"}
                      </strong>
                    </span>
                    <span>
                      Ukuran:{" "}
                      <strong className="text-[#111815]">
                        {spotlightApp.latestRelease?.fileSizeLabel ?? "-"}
                      </strong>
                    </span>
                    <span>{spotlightApp.minAndroid}</span>
                    <span>{spotlightApp.downloadCount} unduhan</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {spotlightApp.latestRelease && (
                    <a
                      href={`/api/releases/${spotlightApp.latestRelease.id}/download`}
                      className="min-h-11 px-5 inline-flex items-center justify-center rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] tactile-press"
                    >
                      Unduh APK v{spotlightApp.latestRelease.versionName}
                    </a>
                  )}
                  <Link
                    href={`/apps/${spotlightApp.slug}`}
                    className="min-h-11 px-5 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {appsList.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#C8D3CC] bg-[#F8FAF9] px-6 py-14 text-center">
            <p className="text-base font-bold text-[#111815]">
              {q || activeCategory !== "Semua"
                ? "Aplikasi tidak ditemukan"
                : "Belum ada aplikasi yang dipublikasikan"}
            </p>
            <p className="text-sm text-[#48544E] mt-1.5 max-w-md mx-auto">
              {q || activeCategory !== "Semua"
                ? "Ubah kata kunci pencarian atau pilih kategori Semua untuk melihat katalog lengkap."
                : "Masuk ke Studio Console untuk mengunggah aplikasi pertama beserta rilis APK-nya."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {q || activeCategory !== "Semua" ? (
                <Link
                  href="/"
                  className="min-h-11 px-5 inline-flex items-center justify-center rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
                >
                  Tampilkan Semua Aplikasi
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="min-h-11 px-5 inline-flex items-center justify-center rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
                >
                  Buka Studio Console
                </Link>
              )}
            </div>
          </section>
        ) : (
          <div className="space-y-10">
            {!q && activeCategory === "Semua" && (
              <section aria-labelledby="charts-heading">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 id="charts-heading" className="text-lg sm:text-xl font-bold text-[#111815]">
                    Daftar Rilis Tersedia
                  </h2>
                  <span className="text-xs font-medium text-[#48544E] tabular-nums">
                    {appsList.length} aplikasi aktif
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {appsList.map((app, index) => (
                    <Link
                      key={app.id}
                      href={`/apps/${app.slug}`}
                      className="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#E2E8E5] bg-white hover:border-[#017A56] hover:bg-[#F8FAF9] transition-colors tactile-press"
                    >
                      <span className="w-6 text-center text-sm font-bold text-[#48544E] tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#111815] group-hover:text-[#017A56] truncate">
                          {app.name}
                        </h3>
                        <p className="text-xs text-[#48544E] truncate mt-0.5">
                          {app.category}
                          {app.latestRelease ? ` · v${app.latestRelease.versionName}` : ""}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#48544E] tabular-nums">
                          {app.latestRelease && (
                            <span>{app.latestRelease.fileSizeLabel}</span>
                          )}
                          <span>{app.downloadCount} unduhan</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(otherApps.length > 0 || q || activeCategory !== "Semua") && (
              <section aria-labelledby="catalog-heading">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 id="catalog-heading" className="text-lg sm:text-xl font-bold text-[#111815]">
                    {q || activeCategory !== "Semua" ? "Hasil Katalog" : "Jelajahi Aplikasi"}
                  </h2>
                  <span className="text-xs font-medium text-[#48544E] tabular-nums">
                    {(q || activeCategory !== "Semua" ? appsList : otherApps).length} aplikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(q || activeCategory !== "Semua" ? appsList : otherApps).map((app) => (
                    <AppShelfCard key={app.id} app={app} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <section
          aria-label="Panduan penguji APK"
          className="mt-12 rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-base font-bold text-[#111815]">
              Pertama kali memasang file APK prarilis di Android?
            </h2>
            <p className="text-sm text-[#48544E] mt-1">
              Baca langkah singkat izin pemasangan sumber tidak dikenal dan verifikasi Play Protect.
            </p>
          </div>
          <Link
            href="/panduan"
            className="min-h-11 px-5 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] shrink-0 tactile-press"
          >
            Buka Panduan
          </Link>
        </section>
      </main>

      <StoreFooter />
    </>
  );
}
