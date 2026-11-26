import React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { getAllAppsForAdmin, getStoreStatsForAdmin } from "@/db/queries";
import { DashboardShell } from "@/components/DashboardShell";
import { CopyTextButton } from "@/components/CopyTextButton";
import { getAppReleaseStage } from "@/lib/constants";
import { getStageLabel, getTileSrc } from "@/lib/app-art";

export const dynamic = "force-dynamic";

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const STAGE_PILL = {
  ready: "bg-accent-soft text-[#17694a]",
  beta: "bg-[#fdf3de] text-[#7a4f00]",
  soon: "bg-raised text-ink-2",
} as const;

export default async function DashboardPage() {
  const user = await requireAdminPage();
  const [appsList, stats] = await Promise.all([
    getAllAppsForAdmin(),
    getStoreStatsForAdmin(),
  ]);

  const statItems = [
    { label: "Total aplikasi", value: stats.totalApps },
    { label: "Tampil di store", value: stats.publishedApps },
    { label: "Total rilis", value: stats.totalReleases },
    { label: "Unduhan tercatat", value: stats.totalDownloads },
  ];

  return (
    <DashboardShell userEmail={user.email}>
      <main className="px-4 py-7 sm:px-8 lg:px-10 lg:py-8 max-w-[1180px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[1.75rem] font-extrabold tracking-[-0.02em]">Aplikasi</h1>
            <p className="mt-1 text-sm text-ink-3">Kelola katalog dan rilis APK.</p>
          </div>
          <Link
            href="/dashboard/apps/new"
            className="min-h-11 px-5 inline-flex items-center gap-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover tactile-press"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah aplikasi
          </Link>
        </div>

        <section
          aria-label="Ringkasan katalog"
          className="mt-6 grid grid-cols-2 lg:grid-cols-4 rounded-[16px] border border-line bg-white"
        >
          {statItems.map((s, i) => (
            <div
              key={s.label}
              className={`px-5 py-5 sm:px-6 border-line ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            >
              <p className="text-[13px] text-ink-3">{s.label}</p>
              <p className="mt-1.5 text-[1.75rem] font-extrabold tabular-nums">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-[16px] border border-line bg-white">
          {appsList.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-base font-semibold">Belum ada aplikasi terdaftar</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">
                Tambahkan aplikasi Android pertama agar penguji bisa mengunduh APK sebelum rilis ke Google Play.
              </p>
              <Link
                href="/dashboard/apps/new"
                className="mt-5 min-h-11 px-5 inline-flex items-center rounded-full bg-accent text-white text-sm font-bold hover:bg-accent-hover"
              >
                Tambah aplikasi pertama
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <h2 className="text-base font-bold">Semua aplikasi</h2>
                <span className="text-[13px] text-ink-3">{appsList.length} aplikasi</span>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-xs text-ink-3">
                      <th className="px-5 py-3 font-semibold">Aplikasi</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Rilis terbaru</th>
                      <th className="px-5 py-3 font-semibold">Unduhan</th>
                      <th className="px-5 py-3 font-semibold">Diperbarui</th>
                      <th className="px-5 py-3 font-semibold">Tampil</th>
                      <th className="px-5 py-3"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appsList.map((app) => {
                      const stage = getAppReleaseStage(app.latestRelease);
                      return (
                        <tr key={app.id} className="border-t border-line hover:bg-[#fafbf9]">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={getTileSrc(app)} alt="" width={44} height={44} className="w-11 h-11 rounded-[11px] object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{app.name}</p>
                                <p className="font-mono text-xs text-ink-3 truncate">{app.packageName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STAGE_PILL[stage]}`}>
                              <span aria-hidden="true" className="status-dot" data-stage={stage} />
                              {getStageLabel(stage)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[13px]">
                            {app.latestRelease ? `v${app.latestRelease.versionName}` : <span className="font-sans text-ink-3">Belum ada</span>}
                          </td>
                          <td className="px-5 py-3.5 tabular-nums">{app.downloadCount}</td>
                          <td className="px-5 py-3.5 text-ink-3">{formatShortDate(app.updatedAt)}</td>
                          <td className="px-5 py-3.5 text-ink-3">{app.isPublished ? "Ya" : "Draf"}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              {app.isPublished && (
                                <CopyTextButton
                                  value={`/apps/${app.slug}`}
                                  relativePath
                                  label="Salin link"
                                  className="min-h-9 px-3 rounded-full text-xs font-semibold text-ink-3 hover:bg-raised hover:text-ink"
                                />
                              )}
                              <Link
                                href={`/dashboard/apps/${app.id}`}
                                className="min-h-9 px-4 inline-flex items-center rounded-full border border-line text-[13px] font-semibold text-accent hover:border-accent"
                              >
                                Kelola
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden divide-y divide-line">
                {appsList.map((app) => {
                  const stage = getAppReleaseStage(app.latestRelease);
                  return (
                    <li key={app.id}>
                      <Link href={`/dashboard/apps/${app.id}`} className="flex items-center gap-3 px-4 py-3.5">
                        <img src={getTileSrc(app)} alt="" width={48} height={48} className="w-12 h-12 rounded-[12px] object-cover shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold truncate">{app.name}</span>
                          <span className="flex items-center gap-2 text-xs text-ink-3">
                            <span className="inline-flex items-center gap-1.5">
                              <span aria-hidden="true" className="status-dot" data-stage={stage} />
                              {getStageLabel(stage)}
                            </span>
                            {app.latestRelease && <span className="font-mono">v{app.latestRelease.versionName}</span>}
                            {!app.isPublished && <span>· Draf</span>}
                          </span>
                        </span>
                        <span className="text-[13px] font-semibold text-accent">Kelola</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </main>
    </DashboardShell>
  );
}
