"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AppWithLatestRelease } from "@/db/queries";
import {
  getAppReleaseStage,
  getSkinMeta,
  type ReleaseStage,
} from "@/lib/constants";
import { useSavedApps } from "@/lib/saved-apps";
import { getCoverSrc, getStageLabel, getTileSrc } from "@/lib/app-art";
import { ApkDownloadLink } from "@/components/ApkDownloadLink";

interface StudioCatalogProps {
  apps: AppWithLatestRelease[];
}

function StatusDot({ stage }: { stage: ReleaseStage }) {
  return <span aria-hidden="true" className="status-dot" data-stage={stage} />;
}

function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function StudioCatalog({ apps }: StudioCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const isSavedView = searchParams.get("view") === "tersimpan";
  const initialCategory = searchParams.get("category") ?? "Semua";

  const [stageFilter, setStageFilter] = useState<"all" | ReleaseStage>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [heroIndex, setHeroIndex] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { savedSet, savedCount, toggleSaved } = useSavedApps();

  const featuredApps = useMemo(() => {
    const featured = apps.filter((a) => a.isFeatured);
    return featured.length > 0 ? featured : apps.slice(0, 3);
  }, [apps]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(apps.map((a) => a.category)));
    return ["Semua", ...unique];
  }, [apps]);

  const filteredApps = useMemo(() => {
    const qLower = query.toLowerCase();
    const words = qLower ? qLower.split(/\s+/).filter(Boolean) : [];
    return apps.filter((app) => {
      if (isSavedView && !savedSet.has(app.slug)) return false;
      const stage = getAppReleaseStage(app.latestRelease);
      if (stageFilter !== "all" && stage !== stageFilter) return false;
      if (categoryFilter !== "Semua" && app.category !== categoryFilter) {
        return false;
      }
      if (words.length > 0) {
        const haystack = [
          app.name,
          app.category,
          app.tagline,
          app.packageName,
          app.developerName,
          app.latestRelease?.versionName ?? "",
          getStageLabel(stage),
          "android apk",
        ]
          .join(" ")
          .toLowerCase();
        if (!words.every((w) => haystack.includes(w))) return false;
      }
      return true;
    });
  }, [apps, isSavedView, savedSet, stageFilter, categoryFilter, query]);

  const isBrowsing =
    !isSavedView && !query && stageFilter === "all" && categoryFilter === "Semua";
  const showHero = isBrowsing && featuredApps.length > 0;
  const activeHero = featuredApps[heroIndex % Math.max(featuredApps.length, 1)];

  const spotlightApps = useMemo(
    () => filteredApps.filter((a) => a.id !== activeHero?.id).slice(0, 6),
    [filteredApps, activeHero]
  );

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2300);
    return () => clearTimeout(t);
  }, [toastMsg]);

  function handleBookmark(app: AppWithLatestRelease) {
    const nowSaved = toggleSaved(app.slug);
    setToastMsg(
      nowSaved ? `${app.name} disimpan.` : `${app.name} dihapus dari tersimpan.`
    );
  }

  function handleResetFilters() {
    setStageFilter("all");
    setCategoryFilter("Semua");
    if (query || isSavedView) router.push("/");
  }

  const gridTitle = isSavedView
    ? "Tersimpan"
    : query
    ? `Hasil untuk “${query}”`
    : isBrowsing
    ? "Semua rilis"
    : "Hasil filter";

  return (
    <main className="site-wrap flex-1 pt-4 pb-12">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 sm:flex-wrap">
        {(
          [
            { value: "all", label: "Semua" },
            { value: "ready", label: "Siap pasang" },
            { value: "beta", label: "Beta" },
            { value: "soon", label: "Segera hadir" },
          ] as const
        ).map((opt) => {
          const active = stageFilter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => setStageFilter(opt.value)}
              className={`shrink-0 h-9 px-3.5 inline-flex items-center gap-1.5 rounded-full border text-[13px] whitespace-nowrap transition-colors ${
                active
                  ? "border-[#bfe3cf] bg-accent-soft text-accent-ink font-semibold"
                  : "border-line bg-white text-ink-2 font-medium hover:border-line-strong"
              }`}
            >
              {opt.value !== "all" && <StatusDot stage={opt.value} />}
              {opt.label}
            </button>
          );
        })}
        {categories.length > 2 && (
          <>
            <span aria-hidden="true" className="shrink-0 mx-1 h-5 w-px bg-line" />
            {categories.slice(1).map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(active ? "Semua" : cat)}
                  className={`shrink-0 h-9 px-3.5 rounded-full border text-[13px] whitespace-nowrap transition-colors ${
                    active
                      ? "border-ink bg-ink text-white font-semibold"
                      : "border-line bg-white text-ink-2 font-medium hover:border-line-strong"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </>
        )}
      </div>

      {showHero && activeHero && (
        <section
          aria-label="Aplikasi pilihan studio"
          className="mt-6 overflow-hidden rounded-[20px] bg-night text-white"
        >
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-10 px-6 py-8 sm:px-10 sm:py-10">
            <div className="w-full md:flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-glow">
                {activeHero.category}
              </p>
              <h1 className="mt-2 text-[1.9rem] sm:text-[2.4rem] leading-[1.12] font-extrabold tracking-[-0.02em]">
                {activeHero.tagline}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-night-ink">
                {activeHero.latestRelease
                  ? `Coba build ${getStageLabel(getAppReleaseStage(activeHero.latestRelease)).toLowerCase()} terbaru ${activeHero.name}`
                  : `${activeHero.name} segera hadir`}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <img
                  src={getTileSrc(activeHero)}
                  alt=""
                  width={52}
                  height={52}
                  className="w-[52px] h-[52px] rounded-[12px] object-cover"
                />
                <div className="flex-1 min-w-[150px]">
                  <p className="text-[15px] font-bold">{activeHero.name}</p>
                  <p className="text-[13px] text-night-mute">
                    {activeHero.developerName}
                    {activeHero.latestRelease && ` · v${activeHero.latestRelease.versionName}`}
                  </p>
                </div>
                {activeHero.latestRelease ? (
                  <ApkDownloadLink
                    releaseId={activeHero.latestRelease.id}
                    apkUrl={activeHero.latestRelease.apkUrl}
                    className="min-h-11 px-6 inline-flex items-center gap-2 rounded-full bg-glow text-glow-ink text-sm font-bold tactile-press hover:brightness-105"
                  >
                    <DownloadIcon />
                    Unduh APK
                  </ApkDownloadLink>
                ) : (
                  <Link
                    href={`/apps/${activeHero.slug}`}
                    className="min-h-11 px-6 inline-flex items-center rounded-full bg-glow text-glow-ink text-sm font-bold tactile-press"
                  >
                    Lihat detail
                  </Link>
                )}
              </div>

              {featuredApps.length > 1 && (
                <div role="tablist" aria-label="Pilih aplikasi sorotan" className="mt-7 flex flex-wrap gap-2">
                  {featuredApps.map((app, idx) => {
                    const active = app.id === activeHero.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setHeroIndex(idx)}
                        className={`min-h-9 px-3.5 rounded-full text-[13px] transition-colors ${
                          active
                            ? "bg-white text-night font-semibold"
                            : "border border-night-line text-night-ink hover:border-night-mute"
                        }`}
                      >
                        {app.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href={`/apps/${activeHero.slug}`}
              aria-label={`Detail ${activeHero.name}`}
              className="w-full md:flex-1 flex justify-center p-2"
            >
              <img
                src={getCoverSrc(activeHero)}
                alt=""
                width={880}
                height={550}
                fetchPriority="high"
                className="w-full max-w-[460px] aspect-[16/10] object-cover glow-frame md:tilt-art"
              />
            </Link>
          </div>
        </section>
      )}

      {isBrowsing && apps.length > 0 && (
        <section aria-labelledby="shelf-icons" className="mt-10">
          <h2 id="shelf-icons" className="text-xl font-semibold">
            Untuk dicoba
          </h2>
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-x-5 gap-y-6">
            {apps.map((app) => {
              const stage = getAppReleaseStage(app.latestRelease);
              return (
                <Link
                  key={app.id}
                  href={`/apps/${app.slug}`}
                  className="app-tile group flex flex-col gap-2 text-ink"
                >
                  <img
                    src={getTileSrc(app)}
                    alt=""
                    width={128}
                    height={128}
                    className="w-full aspect-square rounded-[22%] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    style={{ backgroundColor: getSkinMeta(app.themeSkin).coverBg }}
                  />
                  <span className="text-[13px] leading-snug line-clamp-2 group-hover:text-accent">
                    {app.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
                    <StatusDot stage={stage} />
                    {getStageLabel(stage)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {isBrowsing && spotlightApps.length > 0 && (
        <section aria-label="Sorotan rilis" className="mt-10">
          <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1">
            {spotlightApps.map((app) => {
              const stage = getAppReleaseStage(app.latestRelease);
              return (
                <article
                  key={app.id}
                  className="snap-start shrink-0 w-[86%] sm:w-[480px] rounded-[16px] bg-night text-white p-5 flex flex-col gap-4"
                >
                  <Link href={`/apps/${app.slug}`} className="flex justify-center pt-2" aria-label={`Detail ${app.name}`}>
                    <img
                      src={getCoverSrc(app)}
                      alt=""
                      width={640}
                      height={360}
                      className="w-[78%] aspect-video object-cover glow-frame"
                    />
                  </Link>
                  <div>
                    <p className="text-[17px] font-bold leading-snug">{app.tagline}</p>
                    <p className="mt-1 text-[13px] text-night-mute">
                      {stage === "ready"
                        ? "Siap dipasang"
                        : stage === "beta"
                        ? "Terbuka untuk penguji"
                        : "Segera hadir"}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2.5">
                    <img
                      src={getTileSrc(app)}
                      alt=""
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-[9px] object-cover"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-semibold truncate">{app.name}</span>
                      <span className="block text-xs text-night-mute">
                        {app.latestRelease
                          ? `v${app.latestRelease.versionName} · ${app.latestRelease.fileSizeLabel}`
                          : "Belum rilis"}
                      </span>
                    </span>
                    {app.latestRelease ? (
                      <ApkDownloadLink
                        releaseId={app.latestRelease.id}
                        apkUrl={app.latestRelease.apkUrl}
                        className="min-h-10 px-4 inline-flex items-center rounded-full bg-glow text-glow-ink text-[13px] font-bold tactile-press"
                      >
                        Unduh
                      </ApkDownloadLink>
                    ) : (
                      <Link
                        href={`/apps/${app.slug}`}
                        className="min-h-10 px-4 inline-flex items-center rounded-full border border-night-line text-[13px] font-semibold text-white"
                      >
                        Detail
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="grid-title" className="mt-11">
        <h2 id="grid-title" className="text-xl font-semibold">
          {gridTitle}
        </h2>
        <p className="mt-0.5 mb-5 text-xs text-ink-3">
          {filteredApps.length} aplikasi
          {isBrowsing && " · build terbaru dari Hammad Studio"}
        </p>

        {filteredApps.length === 0 ? (
          <div className="rounded-[18px] border border-line bg-raised px-6 py-12 grid justify-items-center text-center">
            <h3 className="text-lg font-semibold text-ink">
              {isSavedView && savedCount === 0
                ? "Belum ada aplikasi tersimpan"
                : apps.length === 0
                ? "Belum ada aplikasi terdaftar"
                : "Aplikasi belum ketemu"}
            </h3>
            <p className="text-sm text-ink-2 mt-1.5 max-w-md">
              {isSavedView && savedCount === 0
                ? "Ketuk ikon penanda di kartu aplikasi yang ingin kamu unduh nanti."
                : apps.length === 0
                ? "Masuk ke dashboard untuk menambahkan aplikasi Android pertama."
                : "Coba kata kunci lain atau reset filter untuk melihat semua rilis."}
            </p>
            <div className="mt-5">
              {apps.length === 0 ? (
                <Link
                  href="/dashboard"
                  className="min-h-11 px-5 inline-flex items-center rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover tactile-press"
                >
                  Buka dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-11 px-5 inline-flex items-center rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover tactile-press"
                >
                  {isSavedView ? "Jelajahi aplikasi" : "Reset pencarian & filter"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7">
            {filteredApps.map((app) => {
              const stage = getAppReleaseStage(app.latestRelease);
              const isSaved = savedSet.has(app.slug);
              return (
                <article key={app.id} className="group flex flex-col gap-3">
                  <Link
                    href={`/apps/${app.slug}`}
                    aria-label={`Detail ${app.name}`}
                    className="block overflow-hidden rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    style={{ backgroundColor: getSkinMeta(app.themeSkin).coverBg }}
                  >
                    <img
                      src={getCoverSrc(app)}
                      alt=""
                      width={640}
                      height={360}
                      className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div className="flex items-center gap-3">
                    <img
                      src={getTileSrc(app)}
                      alt=""
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-[10px] object-cover"
                    />
                    <Link href={`/apps/${app.slug}`} className="flex-1 min-w-0 text-ink">
                      <span className="block text-sm truncate group-hover:text-accent">{app.name}</span>
                      <span className="block text-xs text-ink-3 truncate">{app.category}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
                        <StatusDot stage={stage} />
                        {getStageLabel(stage)}
                        {app.latestRelease && (
                          <span className="font-mono">· v{app.latestRelease.versionName}</span>
                        )}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleBookmark(app)}
                      aria-pressed={isSaved}
                      aria-label={isSaved ? `Hapus ${app.name} dari tersimpan` : `Simpan ${app.name}`}
                      className={`w-10 h-10 shrink-0 grid place-items-center rounded-full transition-colors ${
                        isSaved ? "text-accent bg-accent-soft" : "text-ink-3 hover:bg-raised hover:text-ink"
                      }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isBrowsing && (
        <section className="mt-12 overflow-hidden rounded-[20px] bg-night flex flex-col md:flex-row">
          <div className="md:flex-1 px-6 py-9 sm:px-11 sm:py-11 text-white flex flex-col justify-center">
            <h2 className="text-[1.6rem] sm:text-[1.9rem] leading-tight font-extrabold tracking-[-0.02em]">
              Pasang APK di HP-mu dalam tiga langkah
            </h2>
            <Link href="/panduan" className="mt-3 text-base sm:text-lg text-night-ink hover:text-glow">
              Baca panduan pasang →
            </Link>
          </div>
          <div aria-hidden="true" className="relative md:flex-1 min-h-[220px] night-glow-bg">
            {apps.slice(0, 2).map((app, i) => (
              <img
                key={app.id}
                src={getCoverSrc(app)}
                alt=""
                width={320}
                height={200}
                className={`absolute w-[44%] aspect-[16/10] object-cover rounded-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.4)] ${
                  i === 0 ? "left-[10%] top-[22%] -rotate-6" : "right-[8%] top-[14%] rotate-[5deg]"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-24 sm:bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night px-4 py-2.5 text-sm font-medium text-white shadow-lg animate-toast-in"
        >
          {toastMsg}
        </div>
      )}
    </main>
  );
}
