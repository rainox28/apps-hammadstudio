import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedAppBySlug } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { getTrackMeta } from "@/lib/constants";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { AppIcon } from "@/components/AppIcon";
import { TrackBadge } from "@/components/TrackBadge";
import { QrCodeModal } from "@/components/QrCodeModal";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { CopyTextButton } from "@/components/CopyTextButton";

export const dynamic = "force-dynamic";

interface AppDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = await getPublishedAppBySlug(slug);
  if (!app) {
    return { title: "Aplikasi tidak ditemukan | apps.hammad.studio" };
  }
  return {
    title: `${app.name} | apps.hammad.studio`,
    description: app.tagline,
  };
}

function formatDateId(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function extractHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "apps.hammad.studio";
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const [session, app] = await Promise.all([
    getSession(),
    getPublishedAppBySlug(slug),
  ]);

  if (!app) {
    notFound();
  }

  const latestRelease = app.releases[0] ?? null;
  const trackMeta = latestRelease ? getTrackMeta(latestRelease.track) : null;

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-[#E2E8E5] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav
          aria-label="Breadcrumb"
          className="text-xs sm:text-sm text-[#48544E] mb-5 flex items-center gap-2 flex-wrap"
        >
          <Link href="/" className="hover:text-[#017A56] font-medium">
            Katalog
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/?category=${encodeURIComponent(app.category)}`}
            className="hover:text-[#017A56] font-medium"
          >
            {app.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#111815] font-semibold truncate">{app.name}</span>
        </nav>

        {app.bannerUrl && (
          <div className="mb-7 rounded-2xl overflow-hidden border border-[#E2E8E5] bg-[#0D1513] max-h-[320px] aspect-[21/9]">
            <img
              src={app.bannerUrl}
              alt={`Banner ${app.name}`}
              width={1200}
              height={514}
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          <div className="min-w-0 space-y-8">
            <section>
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <AppIcon name={app.name} iconUrl={app.iconUrl} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {latestRelease && <TrackBadge track={latestRelease.track} />}
                    <span className="text-xs font-semibold text-[#48544E]">
                      {app.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#111815] mt-2 tracking-tight">
                    {app.name}
                  </h1>
                  <p className="text-sm font-semibold text-[#017A56] mt-0.5">
                    {app.developerName}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="text-xs font-mono text-[#48544E] bg-[#F8FAF9] border border-[#E2E8E5] px-2.5 py-1 rounded-md break-all">
                      {app.packageName}
                    </code>
                    <CopyTextButton
                      value={app.packageName}
                      label="Salin ID"
                      className="min-h-8 px-2.5 rounded-md border border-[#E2E8E5] bg-white text-xs font-semibold text-[#48544E] hover:text-[#111815] hover:border-[#C8D3CC]"
                    />
                  </div>
                </div>
              </div>

              <div
                aria-label="Ringkasan rilis aplikasi"
                className="mt-6 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8E5] rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9]"
              >
                <div className="p-3.5 sm:px-4 text-center">
                  <p className="text-xs text-[#48544E]">Versi Terbaru</p>
                  <p className="text-sm font-bold text-[#111815] mt-0.5 tabular-nums">
                    {latestRelease ? `v${latestRelease.versionName}` : "Belum ada"}
                  </p>
                </div>
                <div className="p-3.5 sm:px-4 text-center">
                  <p className="text-xs text-[#48544E]">Ukuran APK</p>
                  <p className="text-sm font-bold text-[#111815] mt-0.5">
                    {latestRelease ? latestRelease.fileSizeLabel : "-"}
                  </p>
                </div>
                <div className="p-3.5 sm:px-4 text-center">
                  <p className="text-xs text-[#48544E]">Unduhan</p>
                  <p className="text-sm font-bold text-[#111815] mt-0.5 tabular-nums">
                    {app.downloadCount}x
                  </p>
                </div>
                <div className="p-3.5 sm:px-4 text-center">
                  <p className="text-xs text-[#48544E]">Minimum OS</p>
                  <p className="text-sm font-bold text-[#111815] mt-0.5">
                    {app.minAndroid}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {latestRelease ? (
                  <>
                    <a
                      href={`/api/releases/${latestRelease.id}/download`}
                      className="min-h-12 px-7 inline-flex items-center justify-center rounded-full bg-[#017A56] text-white text-sm sm:text-base font-semibold hover:bg-[#016346] tactile-press"
                    >
                      Unduh APK v{latestRelease.versionName}
                    </a>
                    <QrCodeModal
                      appName={app.name}
                      versionName={latestRelease.versionName}
                      downloadPath={`/api/releases/${latestRelease.id}/download`}
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="min-h-12 px-6 inline-flex items-center justify-center rounded-full bg-[#E2E8E5] text-[#48544E] text-sm font-semibold"
                  >
                    Belum ada rilis APK
                  </button>
                )}

                <CopyTextButton
                  value={`/apps/${app.slug}`}
                  relativePath
                  label="Bagikan Tautan"
                  copiedLabel="Tautan Tersalin"
                  className="min-h-11 px-4 rounded-full border border-[#C8D3CC] bg-white text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56]"
                />
              </div>
            </section>

            <section>
              <ScreenshotGallery appName={app.name} screenshots={app.screenshots} />
            </section>

            <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-[#111815]">
                Tentang aplikasi ini
              </h2>
              <p className="text-sm sm:text-base font-medium text-[#111815] mt-2">
                {app.tagline}
              </p>
              <div className="mt-3 text-sm sm:text-[15px] text-[#48544E] whitespace-pre-line leading-relaxed">
                {app.description}
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2E8E5] flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-semibold text-[#111815]">
                  {app.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-semibold text-[#111815]">
                  {app.minAndroid}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F8FAF9] border border-[#E2E8E5] text-xs font-medium text-[#48544E]">
                  Diperbarui {formatDateId(app.updatedAt)}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-[#111815]">
                Verifikasi &amp; Keamanan Build
              </h2>
              <p className="text-xs sm:text-sm text-[#48544E] mt-1">
                Detail teknis paket instalasi untuk memastikan keaslian build sebelum pemasangan.
              </p>

              <dl className="mt-4 divide-y divide-[#E2E8E5] text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#48544E]">Package Identifier</dt>
                  <dd className="font-mono text-xs sm:text-sm font-medium text-[#111815] break-all">
                    {app.packageName}
                  </dd>
                </div>
                {latestRelease && (
                  <>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#48544E]">Jalur Rilis</dt>
                      <dd className="font-semibold text-[#111815]">
                        {trackMeta?.label} (Build {latestRelease.versionCode})
                      </dd>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#48544E]">Host Sumber APK</dt>
                      <dd className="font-mono text-xs sm:text-sm text-[#111815]">
                        {extractHost(latestRelease.apkUrl)}
                      </dd>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#48544E]">SHA-256 Checksum</dt>
                      <dd className="font-mono text-xs text-[#111815] break-all">
                        {latestRelease.sha256 || "Belum dilampirkan oleh pengelola"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {latestRelease && (
              <section className="rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#111815]">
                    Yang baru di v{latestRelease.versionName}
                  </h2>
                  <span className="text-xs text-[#48544E]">
                    {formatDateId(latestRelease.publishedAt)}
                  </span>
                </div>
                <div className="mt-3 text-sm text-[#111815] whitespace-pre-line leading-relaxed">
                  {latestRelease.releaseNotes}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5">
              <h2 className="text-base font-bold text-[#111815]">
                Riwayat Rilis ({app.releases.length})
              </h2>
              {app.releases.length === 0 ? (
                <p className="text-sm text-[#48544E] mt-2">
                  Belum ada versi rilis yang dicatat.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-[#E2E8E5]">
                  {app.releases.map((rel) => (
                    <div key={rel.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold text-[#111815] tabular-nums">
                            v{rel.versionName}
                          </span>
                          <TrackBadge track={rel.track} />
                        </div>
                        <a
                          href={`/api/releases/${rel.id}/download`}
                          className="min-h-9 px-3 inline-flex items-center rounded-full border border-[#C8D3CC] bg-white text-xs font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] shrink-0"
                        >
                          Unduh
                        </a>
                      </div>
                      <p className="text-xs text-[#48544E] tabular-nums">
                        {formatDateId(rel.publishedAt)} · {rel.fileSizeLabel} · {rel.downloadCount}x
                      </p>
                      <p className="text-xs text-[#48544E] whitespace-pre-line leading-relaxed">
                        {rel.releaseNotes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5">
              <h2 className="text-sm font-bold text-[#111815]">
                Bantuan Pemasangan
              </h2>
              <p className="text-xs text-[#48544E] mt-1 leading-relaxed">
                Android meminta izin sumber tidak dikenal saat instalasi pertama? Ikuti panduan 3 langkah.
              </p>
              <Link
                href="/panduan"
                className="mt-3 min-h-10 px-4 inline-flex items-center rounded-full bg-[#E6F4EE] text-xs font-semibold text-[#017A56] hover:bg-[#D5EDE3]"
              >
                Baca Panduan Pasang APK
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}
