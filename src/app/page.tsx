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
  const catalogApps = spotlightApp
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
      <Suspense fallback={<div className="h-16 border-b border-[#E4EAE6] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E4EAE6]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141917]">
              Katalog Aplikasi Prarilis
            </h1>
            <p className="text-sm sm:text-base text-[#49544E] mt-1">
              Unduh build APK Android langsung dari proyek Hammad Studio sebelum rilis resmi di Google Play.
            </p>
          </div>
          <Link
            href="/panduan"
            className="min-h-11 px-4 inline-flex items-center justify-center rounded-lg border border-[#C8D3CC] bg-white text-sm font-semibold text-[#141917] hover:border-[#017A56] hover:text-[#017A56] shrink-0"
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
                className={`min-h-11 px-4 inline-flex items-center rounded-full text-sm font-semibold whitespace-nowrap border transition-colors tactile-press ${
                  isActive
                    ? "bg-[#017A56] text-white border-[#017A56]"
                    : "bg-[#F5F7F6] text-[#141917] border-[#E4EAE6] hover:border-[#017A56]"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </nav>

        {q && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F7F6] border border-[#E4EAE6] px-4 py-3">
            <p className="text-sm text-[#141917]">
              Menampilkan hasil untuk <span className="font-semibold">{q}</span> ({appsList.length} aplikasi)
            </p>
            <Link
              href={activeCategory !== "Semua" ? `/?category=${encodeURIComponent(activeCategory)}` : "/"}
              className="text-sm font-semibold text-[#017A56] hover:underline"
            >
              Hapus pencarian
            </Link>
          </div>
        )}

        {spotlightApp && (
          <section aria-labelledby="spotlight-heading" className="mb-8">
            <div className="rounded-2xl border border-[#C8D3CC] bg-[#F5F7F6] p-5 sm:p-7">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                  <AppIcon
                    name={spotlightApp.name}
                    iconUrl={spotlightApp.iconUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {spotlightApp.latestRelease && (
                        <TrackBadge track={spotlightApp.latestRelease.track} />
                      )}
                      <span className="text-xs font-medium text-[#49544E]">
                        {spotlightApp.category}
                      </span>
                    </div>
                    <h2
                      id="spotlight-heading"
                      className="text-xl sm:text-2xl font-bold text-[#141917]"
                    >
                      {spotlightApp.name}
                    </h2>
                    <p className="text-xs font-mono text-[#49544E] mt-0.5 truncate">
                      {spotlightApp.packageName}
                    </p>
                    <p className="text-sm sm:text-base text-[#49544E] mt-2.5 max-w-2xl">
                      {spotlightApp.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#49544E] tabular-nums">
                      <span>
                        Versi: {spotlightApp.latestRelease ? `v${spotlightApp.latestRelease.versionName}` : "Belum dirilis"}
                      </span>
                      <span>{spotlightApp.minAndroid}</span>
                      <span>{spotlightApp.downloadCount} unduhan</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
                  {spotlightApp.latestRelease ? (
                    <a
                      href={`/api/releases/${spotlightApp.latestRelease.id}/download`}
                      className="min-h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] tactile-press"
                    >
                      Unduh APK v{spotlightApp.latestRelease.versionName}
                    </a>
                  ) : null}
                  <Link
                    href={`/apps/${spotlightApp.slug}`}
                    className="min-h-11 px-5 inline-flex items-center justify-center rounded-xl border border-[#C8D3CC] bg-white text-sm font-semibold text-[#141917] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
                  >
                    Lihat Detail Aplikasi
                  </Link>
                </div>
              </div>

              {spotlightApp.screenshots.length > 0 && (
                <div className="mt-6 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {spotlightApp.screenshots.slice(0, 5).map((src, i) => (
                    <Link
                      key={`${src}-${i}`}
                      href={`/apps/${spotlightApp.slug}`}
                      className="shrink-0 rounded-xl overflow-hidden border border-[#E4EAE6] bg-white"
                    >
                      <img
                        src={src}
                        alt={`Pratinjau ${spotlightApp.name} layar ${i + 1}`}
                        width={150}
                        height={266}
                        className="h-44 w-auto object-cover"
                        fetchPriority={i === 0 ? "high" : "auto"}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section aria-labelledby="catalog-heading">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 id="catalog-heading" className="text-lg sm:text-xl font-bold text-[#141917]">
              {spotlightApp ? "Aplikasi Lainnya" : "Semua Aplikasi"}
            </h2>
            <span className="text-xs font-medium text-[#49544E] tabular-nums">
              {catalogApps.length} aplikasi
            </span>
          </div>

          {appsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C8D3CC] bg-[#F5F7F6] px-6 py-12 text-center">
              <p className="text-base font-bold text-[#141917]">
                {q || activeCategory !== "Semua"
                  ? "Aplikasi tidak ditemukan"
                  : "Belum ada aplikasi yang dipublikasikan"}
              </p>
              <p className="text-sm text-[#49544E] mt-1.5 max-w-md mx-auto">
                {q || activeCategory !== "Semua"
                  ? "Ubah kata kunci pencarian atau pilih kategori Semua untuk melihat daftar lengkap."
                  : "Masuk ke Dashboard admin untuk menambahkan aplikasi pertama beserta file APK rilisnya."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {q || activeCategory !== "Semua" ? (
                  <Link
                    href="/"
                    className="min-h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
                  >
                    Tampilkan Semua Aplikasi
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="min-h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
                  >
                    Buka Dashboard
                  </Link>
                )}
              </div>
            </div>
          ) : catalogApps.length === 0 ? (
            <p className="text-sm text-[#49544E] py-4">
              Semua aplikasi aktif sudah ditampilkan pada sorotan utama di atas.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogApps.map((app) => (
                <AppShelfCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </section>
      </main>

      <StoreFooter />
    </>
  );
}
