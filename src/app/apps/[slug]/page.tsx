import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedAppBySlug } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { getSkinMeta, getTrackMeta } from "@/lib/constants";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
    return { title: "Aplikasi tidak ditemukan | Studio Apps" };
  }
  return {
    title: `${app.name} | Studio Apps`,
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
  const skinMeta = getSkinMeta(app.themeSkin);

  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-[#dce3da] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="site-wrap flex-1 py-6 sm:py-8">
        <nav
          aria-label="Breadcrumb"
          className="text-xs sm:text-sm text-[#52625a] mb-5 flex items-center gap-2 flex-wrap"
        >
          <Link href="/" className="hover:text-[#006c4c] font-semibold">
            Katalog
          </Link>
          <span aria-hidden="true">/</span>
          <span>{app.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#18221c] font-bold truncate">{app.name}</span>
        </nav>

        {app.bannerUrl && (
          <div
            className="mb-7 rounded-[22px] overflow-hidden border border-[#dce3da] max-h-[320px] aspect-[21/9]"
            style={{ backgroundColor: skinMeta.coverBg }}
          >
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
          <div className="min-w-0 space-y-7">
            <section>
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <AppIcon
                  name={app.name}
                  iconUrl={app.iconUrl}
                  skin={app.themeSkin}
                  size="xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {latestRelease && <TrackBadge track={latestRelease.track} />}
                    <span className="text-xs font-semibold text-[#52625a]">
                      {app.category}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-[2.1rem] font-extrabold text-[#18221c] mt-2 tracking-[-0.04em]">
                    {app.name}
                  </h1>
                  <p className="text-sm font-bold text-[#006c4c] mt-0.5">
                    {app.developerName}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <code className="text-xs font-mono text-[#52625a] bg-[#f4f6f1] border border-[#dce3da] px-2.5 py-1 rounded-lg break-all">
                      {app.packageName}
                    </code>
                    <CopyTextButton
                      value={app.packageName}
                      label="Salin ID"
                      className="min-h-8 px-2.5 rounded-lg border border-[#dce3da] bg-white text-xs font-semibold text-[#52625a] hover:text-[#18221c] hover:border-[#bfcdbc]"
                    />
                  </div>
                </div>
              </div>

              <div
                aria-label="Ringkasan rilis aplikasi"
                className="mt-6 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#dbe3d8] rounded-xl bg-[#f4f6f1] border border-[#dce3da]"
              >
                <div className="p-3.5 text-center">
                  <p className="text-xs text-[#5a695f]">Versi Terbaru</p>
                  <p className="text-sm font-bold text-[#18221c] mt-0.5 tabular-nums">
                    {latestRelease ? `v${latestRelease.versionName}` : "Belum ada"}
                  </p>
                </div>
                <div className="p-3.5 text-center">
                  <p className="text-xs text-[#5a695f]">Ukuran APK</p>
                  <p className="text-sm font-bold text-[#18221c] mt-0.5">
                    {latestRelease ? latestRelease.fileSizeLabel : "-"}
                  </p>
                </div>
                <div className="p-3.5 text-center">
                  <p className="text-xs text-[#5a695f]">Unduhan</p>
                  <p className="text-sm font-bold text-[#18221c] mt-0.5 tabular-nums">
                    {app.downloadCount}x
                  </p>
                </div>
                <div className="p-3.5 text-center">
                  <p className="text-xs text-[#5a695f]">Minimum OS</p>
                  <p className="text-sm font-bold text-[#18221c] mt-0.5">
                    {app.minAndroid}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {latestRelease ? (
                  <>
                    <a
                      href={`/api/releases/${latestRelease.id}/download`}
                      className="min-h-12 px-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#006c4c] text-white text-sm sm:text-base font-bold hover:bg-[#07543c] tactile-press"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 15.5v3A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
                      </svg>
                      <span>Unduh APK v{latestRelease.versionName}</span>
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
                    className="min-h-12 px-6 inline-flex items-center justify-center rounded-[10px] bg-[#e9eee6] text-[#52625a] text-sm font-bold"
                  >
                    Belum ada rilis APK
                  </button>
                )}

                <CopyTextButton
                  value={`/apps/${app.slug}`}
                  relativePath
                  label="Bagikan Tautan"
                  copiedLabel="Tautan Tersalin"
                  className="min-h-11 px-4 rounded-[10px] border border-[#cbd8cc] bg-white text-sm font-bold text-[#355d42] hover:bg-[#f0f5ed]"
                />
              </div>
            </section>

            <section>
              <ScreenshotGallery appName={app.name} screenshots={app.screenshots} />
            </section>

            <section className="rounded-[18px] border border-[#dce3da] bg-white p-5 sm:p-6 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#18221c]">
                Tentang aplikasi ini
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#18221c]">
                {app.tagline}
              </p>
              <div className="text-sm sm:text-[15px] text-[#45554c] whitespace-pre-line leading-relaxed">
                {app.description}
              </div>

              {app.features && app.features.length > 0 && (
                <div className="pt-2">
                  <h3 className="text-sm font-bold text-[#18221c]">Fitur utama</h3>
                  <ul className="mt-2.5 space-y-2 text-sm text-[#425248]">
                    {app.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#287552" strokeWidth="2.1" aria-hidden="true" className="mt-0.5 shrink-0">
                          <path d="m4.5 12 5 5L19.8 6.8" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {app.testerNote && (
                <div className="rounded-[10px] border border-[#e1e9dc] bg-[#eff5eb] px-4 py-3 flex items-start gap-2.5 text-sm text-[#3c5543]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="mt-0.5 shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5m0-8.5h.01" />
                  </svg>
                  <span>{app.testerNote}</span>
                </div>
              )}
            </section>

            <section className="rounded-[18px] border border-[#dce3da] bg-white p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-[#18221c]">
                Verifikasi &amp; Keamanan Build
              </h2>
              <dl className="mt-4 divide-y divide-[#dce3da] text-sm">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[#52625a]">Package Identifier</dt>
                  <dd className="font-mono text-xs sm:text-sm font-medium text-[#18221c] break-all">
                    {app.packageName}
                  </dd>
                </div>
                {latestRelease && (
                  <>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#52625a]">Jalur Rilis</dt>
                      <dd className="font-semibold text-[#18221c]">
                        {trackMeta?.label} (Build {latestRelease.versionCode})
                      </dd>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#52625a]">Host Sumber APK</dt>
                      <dd className="font-mono text-xs sm:text-sm text-[#18221c]">
                        {extractHost(latestRelease.apkUrl)}
                      </dd>
                    </div>
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <dt className="text-[#52625a]">SHA-256 Checksum</dt>
                      <dd className="font-mono text-xs text-[#18221c] break-all">
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
              <section className="rounded-[18px] border border-[#d5e5d1] bg-[#eaf2e6] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#263e2c]">
                    Yang baru di v{latestRelease.versionName}
                  </h2>
                  <span className="text-xs text-[#4a604f]">
                    {formatDateId(latestRelease.publishedAt)}
                  </span>
                </div>
                <div className="mt-3 text-sm text-[#263e2c] whitespace-pre-line leading-relaxed">
                  {latestRelease.releaseNotes}
                </div>
              </section>
            )}

            <section className="rounded-[18px] border border-[#dce3da] bg-white p-5">
              <h2 className="text-base font-bold text-[#18221c]">
                Riwayat Rilis ({app.releases.length})
              </h2>
              {app.releases.length === 0 ? (
                <p className="text-sm text-[#52625a] mt-2">
                  Belum ada versi rilis yang dicatat.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-[#dce3da]">
                  {app.releases.map((rel) => (
                    <div key={rel.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold text-[#18221c] tabular-nums">
                            v{rel.versionName}
                          </span>
                          <TrackBadge track={rel.track} />
                        </div>
                        <a
                          href={`/api/releases/${rel.id}/download`}
                          className="min-h-9 px-3 inline-flex items-center rounded-[8px] border border-[#d6e3d7] bg-[#f2f7ef] text-xs font-bold text-[#1e6344] hover:bg-[#e3eedf] shrink-0"
                        >
                          Unduh
                        </a>
                      </div>
                      <p className="text-xs text-[#52625a] tabular-nums">
                        {formatDateId(rel.publishedAt)} · {rel.fileSizeLabel} · {rel.downloadCount}x
                      </p>
                      <p className="text-xs text-[#52625a] whitespace-pre-line leading-relaxed">
                        {rel.releaseNotes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[18px] border border-[#dce3da] bg-white p-5">
              <h2 className="text-sm font-bold text-[#18221c]">
                Bantuan Pemasangan
              </h2>
              <p className="text-xs text-[#52625a] mt-1 leading-relaxed">
                Android meminta izin sumber tidak dikenal saat instalasi pertama? Ikuti panduan 3 langkah.
              </p>
              <Link
                href="/panduan"
                className="mt-3 min-h-10 px-4 inline-flex items-center rounded-[10px] border border-[#d6e3d7] bg-[#f2f7ef] text-xs font-bold text-[#1e6344] hover:bg-[#e3eedf]"
              >
                Baca Panduan Pasang APK
              </Link>
            </section>
          </aside>
        </div>
      </main>

      <StoreFooter />

      <Suspense fallback={null}>
        <MobileBottomNav isAuthenticated={Boolean(session)} />
      </Suspense>
    </>
  );
}
