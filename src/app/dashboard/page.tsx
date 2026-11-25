import React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { getAllAppsForAdmin, getStoreStatsForAdmin } from "@/db/queries";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AppIcon } from "@/components/AppIcon";
import { TrackBadge } from "@/components/TrackBadge";

export const dynamic = "force-dynamic";

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DashboardPage() {
  const user = await requireAdminPage();
  const [appsList, stats] = await Promise.all([
    getAllAppsForAdmin(),
    getStoreStatsForAdmin(),
  ]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7F6]">
      <DashboardHeader userEmail={user.email} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#141917] tracking-tight">
              Daftar Aplikasi &amp; Rilis APK
            </h1>
            <p className="text-sm text-[#49544E] mt-1">
              Atur publikasi aplikasi, unggah aset lewat UploadThing, dan kelola versi APK.
            </p>
          </div>
          <Link
            href="/dashboard/apps/new"
            className="min-h-11 px-4 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] tactile-press shrink-0"
          >
            Tambah Aplikasi Baru
          </Link>
        </div>

        <section
          aria-label="Ringkasan data katalog"
          className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="rounded-xl border border-[#E4EAE6] bg-white p-4">
            <p className="text-xs font-medium text-[#49544E]">Total Aplikasi</p>
            <p className="text-2xl font-bold text-[#141917] mt-1 tabular-nums">
              {stats.totalApps}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4EAE6] bg-white p-4">
            <p className="text-xs font-medium text-[#49544E]">Dipublikasikan</p>
            <p className="text-2xl font-bold text-[#017A56] mt-1 tabular-nums">
              {stats.publishedApps}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4EAE6] bg-white p-4">
            <p className="text-xs font-medium text-[#49544E]">Total Versi Rilis</p>
            <p className="text-2xl font-bold text-[#141917] mt-1 tabular-nums">
              {stats.totalReleases}
            </p>
          </div>
          <div className="rounded-xl border border-[#E4EAE6] bg-white p-4">
            <p className="text-xs font-medium text-[#49544E]">Unduhan Tercatat</p>
            <p className="text-2xl font-bold text-[#141917] mt-1 tabular-nums">
              {stats.totalDownloads}
            </p>
          </div>
        </section>

        <section className="mt-6">
          {appsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C8D3CC] bg-white px-6 py-12 text-center">
              <p className="text-base font-bold text-[#141917]">
                Belum ada aplikasi terdaftar
              </p>
              <p className="text-sm text-[#49544E] mt-1 max-w-md mx-auto">
                Tambahkan aplikasi Android pertama Anda agar penguji dapat mengunduh APK sebelum rilis ke Google Play.
              </p>
              <Link
                href="/dashboard/apps/new"
                className="mt-5 min-h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346]"
              >
                Tambah Aplikasi Pertama
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E4EAE6] bg-white overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4EAE6] bg-[#F5F7F6] text-xs font-semibold text-[#49544E]">
                      <th className="py-3 px-4">Aplikasi</th>
                      <th className="py-3 px-4">Rilis Terbaru</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Unduhan</th>
                      <th className="py-3 px-4">Diperbarui</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4EAE6] text-sm">
                    {appsList.map((app) => (
                      <tr key={app.id} className="hover:bg-[#FAFDFB]">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                            <div className="min-w-0">
                              <p className="font-bold text-[#141917] truncate">
                                {app.name}
                              </p>
                              <p className="text-xs font-mono text-[#49544E] truncate">
                                {app.packageName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {app.latestRelease ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#141917] tabular-nums">
                                v{app.latestRelease.versionName}
                              </span>
                              <TrackBadge track={app.latestRelease.track} />
                            </div>
                          ) : (
                            <span className="text-xs text-[#49544E]">
                              Belum ada rilis
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                              app.isPublished
                                ? "bg-[#E6F4EE] text-[#017A56] border-[#B7DFCE]"
                                : "bg-[#F5F7F6] text-[#49544E] border-[#E4EAE6]"
                            }`}
                          >
                            {app.isPublished ? "Publik" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 tabular-nums font-medium text-[#141917]">
                          {app.downloadCount}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#49544E]">
                          {formatShortDate(app.updatedAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {app.isPublished && (
                              <Link
                                href={`/apps/${app.slug}`}
                                className="min-h-11 px-3 inline-flex items-center rounded-lg border border-[#E4EAE6] text-xs font-semibold text-[#49544E] hover:text-[#141917] hover:bg-[#F5F7F6]"
                              >
                                Store
                              </Link>
                            )}
                            <Link
                              href={`/dashboard/apps/${app.id}`}
                              className="min-h-11 px-3.5 inline-flex items-center rounded-lg bg-[#017A56] text-white text-xs font-semibold hover:bg-[#016346]"
                            >
                              Kelola &amp; Rilis
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-[#E4EAE6]">
                {appsList.map((app) => (
                  <div key={app.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-[#141917] truncate">
                            {app.name}
                          </p>
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold border ${
                              app.isPublished
                                ? "bg-[#E6F4EE] text-[#017A56] border-[#B7DFCE]"
                                : "bg-[#F5F7F6] text-[#49544E] border-[#E4EAE6]"
                            }`}
                          >
                            {app.isPublished ? "Publik" : "Draft"}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#49544E] truncate mt-0.5">
                          {app.packageName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#49544E]">
                      <div className="flex items-center gap-2">
                        {app.latestRelease ? (
                          <>
                            <span className="font-semibold text-[#141917]">
                              v{app.latestRelease.versionName}
                            </span>
                            <TrackBadge track={app.latestRelease.track} />
                          </>
                        ) : (
                          <span>Belum ada APK</span>
                        )}
                      </div>
                      <span className="tabular-nums">{app.downloadCount} unduhan</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/apps/${app.id}`}
                        className="flex-1 min-h-11 px-3 inline-flex items-center justify-center rounded-xl bg-[#017A56] text-white text-xs font-semibold hover:bg-[#016346]"
                      >
                        Kelola &amp; Rilis
                      </Link>
                      {app.isPublished && (
                        <Link
                          href={`/apps/${app.slug}`}
                          className="min-h-11 px-4 inline-flex items-center justify-center rounded-xl border border-[#C8D3CC] text-xs font-semibold text-[#141917]"
                        >
                          Store
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
