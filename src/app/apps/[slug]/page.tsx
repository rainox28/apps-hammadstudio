import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedAppBySlug, getPublishedApps } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { getAppReleaseStage, getSkinMeta, getTrackMeta } from "@/lib/constants";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { TrackBadge } from "@/components/TrackBadge";
import { QrCodeModal } from "@/components/QrCodeModal";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { CopyTextButton } from "@/components/CopyTextButton";
import { getCoverSrc, getStageLabel, getTileSrc } from "@/lib/app-art";

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
  const [session, app, allApps] = await Promise.all([
    getSession(),
    getPublishedAppBySlug(slug),
    getPublishedApps(),
  ]);

  if (!app) {
    notFound();
  }

  const latestRelease = app.releases[0] ?? null;
  const trackMeta = latestRelease ? getTrackMeta(latestRelease.track) : null;
  const skinMeta = getSkinMeta(app.themeSkin);
  const stage = getAppReleaseStage(latestRelease);
  const coverSrc = getCoverSrc(app);
  const otherApps = allApps.filter((a) => a.id !== app.id).slice(0, 4);

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <section className="bg-night text-white">
        <div className="site-wrap py-9 sm:py-12 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:flex-1 min-w-0">
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[13px] text-night-mute">
              <Link href="/" className="hover:text-white">Katalog</Link>
              <span aria-hidden="true">/</span>
              <span>{app.category}</span>
            </nav>
            <div className="flex items-center gap-4">
              {app.iconUrl && (
                <img
                  src={app.iconUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] object-cover shrink-0"
                />
              )}
              <h1 className="text-[2rem] sm:text-[2.9rem] leading-[1.08] font-extrabold tracking-[-0.025em]">
                {app.name}
              </h1>
            </div>
            <p className="mt-2 text-base font-semibold text-glow">{app.developerName}</p>
            <p className="mt-1 text-sm text-night-mute">{app.tagline}</p>

            <dl aria-label="Ringkasan rilis" className="mt-7 flex flex-wrap gap-y-4">
              <div className="pr-5 sm:pr-6">
                <dd className="flex items-center gap-1.5 text-[15px] font-bold">
                  <span aria-hidden="true" className="status-dot" data-stage={stage} />
                  {getStageLabel(stage)}
                </dd>
                <dt className="mt-1 text-xs text-night-mute">Status</dt>
              </div>
              <div className="px-5 sm:px-6 border-l border-night-line">
                <dd className="font-mono text-[15px]">{latestRelease ? latestRelease.versionName : "—"}</dd>
                <dt className="mt-1 text-xs text-night-mute">Versi</dt>
              </div>
              <div className="px-5 sm:px-6 border-l border-night-line">
                <dd className="text-[15px] font-bold">{latestRelease ? latestRelease.fileSizeLabel : "—"}</dd>
                <dt className="mt-1 text-xs text-night-mute">Ukuran</dt>
              </div>
              <div className="px-5 sm:px-6 border-l border-night-line">
                <dd className="text-[15px] font-bold">{app.minAndroid.replace("Android ", "")}</dd>
                <dt className="mt-1 text-xs text-night-mute">Android</dt>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {latestRelease ? (
                <>
                  <a
                    href={`/api/releases/${latestRelease.id}/download`}
                    className="min-h-12 px-7 inline-flex items-center gap-2 rounded-full bg-glow text-glow-ink text-[15px] font-bold tactile-press hover:brightness-105"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
                    </svg>
                    Unduh APK
                  </a>
                  <QrCodeModal
                    tone="dark"
                    appName={app.name}
                    versionName={latestRelease.versionName}
                    downloadPath={`/api/releases/${latestRelease.id}/download`}
                  />
                  <span className="text-xs text-night-mute">Dirilis {formatDateId(latestRelease.publishedAt)}</span>
                </>
              ) : (
                <span className="min-h-12 px-6 inline-flex items-center rounded-full border border-night-line text-sm font-semibold text-night-ink">
                  Belum ada rilis APK
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:flex-1 flex justify-center p-2">
            <img
              src={coverSrc}
              alt={`Artwork ${app.name}`}
              width={920}
              height={575}
              fetchPriority="high"
              className="w-full max-w-[460px] aspect-[16/10] object-cover glow-frame md:tilt-art"
              style={{ backgroundColor: skinMeta.coverBg }}
            />
          </div>
        </div>
      </section>

      <div className="site-wrap flex-1 pt-10 pb-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-12 items-start">
        <main className="min-w-0 space-y-10">
          {app.screenshots.length > 0 && (
            <section aria-labelledby="ss-title">
              <h2 id="ss-title" className="mb-4 text-xl font-semibold">Tangkapan layar</h2>
              <ScreenshotGallery appName={app.name} screenshots={app.screenshots} />
            </section>
          )}

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="text-xl font-semibold">Tentang aplikasi ini</h2>
            <div className="mt-3 max-w-[66ch] text-[15px] leading-[1.7] text-ink-2 whitespace-pre-line">
              {app.description}
            </div>
            {app.features && app.features.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Fitur utama">
                {app.features.map((feat, idx) => (
                  <li key={idx} className="px-3.5 py-2 rounded-full border border-line text-[13px] text-ink-2">
                    {feat}
                  </li>
                ))}
              </ul>
            )}
            {app.testerNote && (
              <p className="mt-5 rounded-[12px] bg-accent-soft px-4 py-3 text-sm text-accent-ink">
                {app.testerNote}
              </p>
            )}
          </section>

          {latestRelease && (
            <section aria-labelledby="new-title">
              <h2 id="new-title" className="text-xl font-semibold">Yang baru di versi ini</h2>
              <div className="mt-3 rounded-[14px] bg-raised px-5 py-5 sm:px-6">
                <p className="font-mono text-[13px] text-accent">
                  v{latestRelease.versionName} · {formatDateId(latestRelease.publishedAt)}
                </p>
                <div className="mt-2.5 text-sm leading-[1.75] text-ink-2 whitespace-pre-line">
                  {latestRelease.releaseNotes}
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="hist-title">
            <h2 id="hist-title" className="text-xl font-semibold">
              Riwayat rilis <span className="font-normal text-ink-3 tabular-nums">{app.releases.length}</span>
            </h2>
            {app.releases.length === 0 ? (
              <p className="mt-2 text-sm text-ink-2">Belum ada versi rilis yang dicatat.</p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-[14px] border border-line divide-y divide-line">
                {app.releases.map((rel) => (
                  <div key={rel.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-3">
                    <span className="font-mono text-sm min-w-[130px]">v{rel.versionName}</span>
                    <TrackBadge track={rel.track} />
                    <span className="flex-1 min-w-[160px] text-[13px] text-ink-3 tabular-nums">
                      {formatDateId(rel.publishedAt)} · {rel.fileSizeLabel}
                    </span>
                    <a
                      href={`/api/releases/${rel.id}/download`}
                      className="min-h-10 inline-flex items-center px-2 text-[13px] font-semibold text-accent hover:text-accent-hover"
                    >
                      Unduh
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-8 lg:sticky lg:top-24">
          <section className="rounded-[14px] border border-line p-5">
            <h2 className="text-base font-semibold">Info build</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-[13px]">
              <dt className="text-ink-3">Paket</dt>
              <dd className="font-mono text-xs break-all">{app.packageName}</dd>
              {latestRelease && (
                <>
                  <dt className="text-ink-3">Jalur</dt>
                  <dd>{trackMeta?.label} · build {latestRelease.versionCode}</dd>
                  <dt className="text-ink-3">Sumber</dt>
                  <dd className="font-mono text-xs break-all">{extractHost(latestRelease.apkUrl)}</dd>
                  <dt className="text-ink-3">SHA-256</dt>
                  <dd className="font-mono text-xs break-all">
                    {latestRelease.sha256 ?? <span className="font-sans text-ink-3">Belum dilampirkan</span>}
                  </dd>
                </>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyTextButton
                value={app.packageName}
                label="Salin ID paket"
                className="min-h-9 px-3 rounded-full border border-line text-xs font-semibold text-ink-2 hover:bg-raised"
              />
              <CopyTextButton
                value={`/apps/${app.slug}`}
                relativePath
                label="Bagikan tautan"
                copiedLabel="Tautan tersalin"
                className="min-h-9 px-3 rounded-full border border-line text-xs font-semibold text-ink-2 hover:bg-raised"
              />
            </div>
          </section>

          {otherApps.length > 0 && (
            <section aria-labelledby="other-title">
              <h2 id="other-title" className="text-base font-semibold">Aplikasi lain</h2>
              <ul className="mt-3.5 space-y-3.5">
                {otherApps.map((o) => {
                  const oStage = getAppReleaseStage(o.latestRelease);
                  return (
                    <li key={o.id}>
                      <Link href={`/apps/${o.slug}`} className="group flex items-center gap-3 text-ink">
                        <img
                          src={getTileSrc(o)}
                          alt=""
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-[14px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm truncate group-hover:text-accent">{o.name}</span>
                          <span className="block text-xs text-ink-3">{o.category}</span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
                            <span aria-hidden="true" className="status-dot" data-stage={oStage} />
                            {getStageLabel(oStage)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <Link
            href="/panduan"
            className="block rounded-[14px] bg-night px-5 py-5 text-white hover:bg-night-2"
          >
            <span className="block text-[15px] font-bold">Baru pertama pasang APK?</span>
            <span className="mt-1 block text-[13px] text-night-ink">Baca panduan pasang →</span>
          </Link>
        </aside>
      </div>

      <StoreFooter />

      <Suspense fallback={null}>
        <MobileBottomNav isAuthenticated={Boolean(session)} />
      </Suspense>
    </>
  );
}
