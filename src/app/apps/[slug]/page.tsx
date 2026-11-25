import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedAppBySlug } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { AppIcon } from "@/components/AppIcon";
import { TrackBadge } from "@/components/TrackBadge";
import { QrCodeModal } from "@/components/QrCodeModal";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";

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

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-[#E4EAE6] bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[#49544E] mb-5 flex items-center gap-2 flex-wrap">
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
          <span className="text-[#141917] font-semibold truncate">{app.name}</span>
        </nav>

        <section className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6">
          <AppIcon name={app.name} iconUrl={app.iconUrl} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              {latestRelease && <TrackBadge track={latestRelease.track} />}
              <span className="text-xs font-medium text-[#49544E]">
                {app.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#141917] mt-1.5 tracking-tight">
              {app.name}
            </h1>
            <p className="text-sm font-semibold text-[#017A56] mt-0.5">
              {app.developerName}
            </p>
            <p className="text-xs font-mono text-[#49544E] mt-1 break-all">
              {app.packageName}
            </p>
            <p className="text-sm sm:text-base text-[#49544E] mt-3 max-w-2xl">
              {app.tagline}
            </p>
          </div>
        </section>

        <section
          aria-label="Informasi teknis rilis"
          className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-[#E4EAE6] bg-[#F5F7F6] p-4"
        >
          <div>
            <p className="text-xs text-[#49544E]">Versi Terbaru</p>
            <p className="text-sm font-bold text-[#141917] mt-0.5 tabular-nums">
              {latestRelease
                ? `v${latestRelease.versionName} (${latestRelease.versionCode})`
                : "Belum tersedia"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#49544E]">Ukuran APK</p>
            <p className="text-sm font-bold text-[#141917] mt-0.5">
              {latestRelease ? latestRelease.fileSizeLabel : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#49544E]">Total Unduhan</p>
            <p className="text-sm font-bold text-[#141917] mt-0.5 tabular-nums">
              {app.downloadCount}x
            </p>
          </div>
          <div>
            <p className="text-xs text-[#49544E]">Minimum OS</p>
            <p className="text-sm font-bold text-[#141917] mt-0.5">
              {app.minAndroid}
            </p>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-3">
          {latestRelease ? (
            <>
              <a
                href={`/api/releases/${latestRelease.id}/download`}
                className="min-h-12 px-6 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm sm:text-base font-semibold hover:bg-[#016346] tactile-press"
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
              className="min-h-12 px-6 inline-flex items-center justify-center rounded-xl bg-[#E4EAE6] text-[#49544E] text-sm font-semibold"
            >
              Belum ada rilis APK
            </button>
          )}
          <Link
            href="/panduan"
            className="min-h-11 px-4 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-[#017A56] hover:bg-[#E6F4EE]"
          >
            Panduan pasang di Android
          </Link>
        </section>

        <section className="mt-8">
          <ScreenshotGallery appName={app.name} screenshots={app.screenshots} />
        </section>

        {latestRelease && (
          <section className="mt-8 rounded-2xl border border-[#E4EAE6] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#141917]">
                Yang Baru di v{latestRelease.versionName}
              </h2>
              <span className="text-xs text-[#49544E]">
                Dirilis {formatDateId(latestRelease.publishedAt)}
              </span>
            </div>
            <div className="mt-3 text-sm text-[#141917] whitespace-pre-line leading-relaxed">
              {latestRelease.releaseNotes}
            </div>
            {latestRelease.sha256 && (
              <div className="mt-4 pt-3 border-t border-[#E4EAE6]">
                <p className="text-xs font-medium text-[#49544E]">SHA-256 Checksum</p>
                <p className="text-xs font-mono text-[#141917] break-all mt-0.5">
                  {latestRelease.sha256}
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-[#E4EAE6] bg-white p-5 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-[#141917]">
            Tentang Aplikasi Ini
          </h2>
          <div className="mt-3 text-sm sm:text-base text-[#49544E] whitespace-pre-line leading-relaxed">
            {app.description}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base sm:text-lg font-bold text-[#141917] mb-3">
            Riwayat Rilis ({app.releases.length})
          </h2>
          {app.releases.length === 0 ? (
            <p className="text-sm text-[#49544E]">Belum ada versi rilis yang dicatat.</p>
          ) : (
            <div className="space-y-3">
              {app.releases.map((rel) => (
                <div
                  key={rel.id}
                  className="rounded-xl border border-[#E4EAE6] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#141917] tabular-nums">
                        v{rel.versionName}
                      </span>
                      <span className="text-xs font-mono text-[#49544E]">
                        build {rel.versionCode}
                      </span>
                      <TrackBadge track={rel.track} />
                      {rel.isLatest && (
                        <span className="text-xs font-semibold text-[#017A56]">
                          Terbaru
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#49544E] mt-1">
                      {formatDateId(rel.publishedAt)} · {rel.fileSizeLabel} · {rel.downloadCount} unduhan
                    </p>
                    <p className="text-sm text-[#49544E] mt-2 whitespace-pre-line">
                      {rel.releaseNotes}
                    </p>
                  </div>
                  <a
                    href={`/api/releases/${rel.id}/download`}
                    className="min-h-11 px-4 inline-flex items-center justify-center rounded-lg border border-[#C8D3CC] bg-white text-sm font-semibold text-[#141917] hover:border-[#017A56] hover:text-[#017A56] shrink-0 tactile-press"
                  >
                    Unduh v{rel.versionName}
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <StoreFooter />
    </>
  );
}
