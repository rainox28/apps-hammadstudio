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
import { AppIcon } from "./AppIcon";

interface StudioCatalogProps {
  apps: AppWithLatestRelease[];
}

const HERO_THEME_VARS: Record<
  string,
  {
    bg: string;
    edge: string;
    text: string;
    soft: string;
    accent: string;
    btnBg: string;
    btnInk: string;
    rule: string;
    tagBg: string;
    defaultArt: string;
  }
> = {
  emerald: {
    bg: "#013d2c",
    edge: "#004e30",
    text: "#fffef5",
    soft: "#d4e1d2",
    accent: "#dbf884",
    btnBg: "#dbf884",
    btnInk: "#17331e",
    rule: "rgba(255,255,255,0.22)",
    tagBg: "rgba(214,245,169,0.12)",
    defaultArt: "/artwork/heroMobile.webp",
  },
  amber: {
    bg: "#f9ad71",
    edge: "#f79d58",
    text: "#342318",
    soft: "#533325",
    accent: "#5c300e",
    btnBg: "#2e261c",
    btnInk: "#fff8e2",
    rule: "rgba(66,34,14,0.28)",
    tagBg: "rgba(255,242,217,0.4)",
    defaultArt: "/artwork/martaboy.webp",
  },
  sky: {
    bg: "#a5e2e9",
    edge: "#65c5d7",
    text: "#122e3b",
    soft: "#234953",
    accent: "#075366",
    btnBg: "#103f4b",
    btnInk: "#f4faf2",
    rule: "rgba(10,66,83,0.24)",
    tagBg: "rgba(244,255,251,0.4)",
    defaultArt: "/artwork/wisata.webp",
  },
  plum: {
    bg: "#d7bef5",
    edge: "#b893e8",
    text: "#26133a",
    soft: "#3d2459",
    accent: "#47236b",
    btnBg: "#26133a",
    btnInk: "#faf5ff",
    rule: "rgba(38,19,58,0.25)",
    tagBg: "rgba(255,255,255,0.4)",
    defaultArt: "/artwork/mobile.webp",
  },
};

function splitTitleLines(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return [name, ""];
  if (words.length === 2) return [words[0], words[1]];
  const splitAt = Math.ceil(words.length / 2);
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

function getStageLabel(stage: ReleaseStage): string {
  if (stage === "ready") return "Siap unduh";
  if (stage === "beta") return "Beta";
  return "Segera hadir";
}

function StageIcon({ stage }: { stage: ReleaseStage }) {
  if (stage === "ready") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 15.5v3A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
      </svg>
    );
  }
  if (stage === "beta") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M9 3.5h6m-5 0v6l-6 8.8a1.7 1.7 0 0 0 1.4 2.7h13.2a1.7 1.7 0 0 0 1.4-2.7l-6-8.8v-6M7.8 14.7h8.4" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 7v5l3.2 2" />
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
  const [quickViewApp, setQuickViewApp] = useState<AppWithLatestRelease | null>(
    null
  );
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

  const showHero = !isSavedView && !query && featuredApps.length > 0;
  const activeHero = featuredApps[heroIndex % Math.max(featuredApps.length, 1)];

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2300);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    if (!quickViewApp) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickViewApp(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickViewApp]);

  function handleBookmark(app: AppWithLatestRelease) {
    const nowSaved = toggleSaved(app.slug);
    setToastMsg(
      nowSaved
        ? `${app.name} disimpan.`
        : `${app.name} dihapus dari tersimpan.`
    );
  }

  function handleResetFilters() {
    setStageFilter("all");
    setCategoryFilter("Semua");
    if (query || isSavedView) {
      router.push("/");
    }
  }

  const heroTheme = activeHero
    ? HERO_THEME_VARS[activeHero.themeSkin] ?? HERO_THEME_VARS.emerald
    : HERO_THEME_VARS.emerald;

  return (
    <main className="site-wrap flex-1 pt-5 sm:pt-8 pb-6">
      {showHero && activeHero && (
        <section
          aria-label="Aplikasi pilihan studio"
          className="relative grid items-center overflow-hidden rounded-[25px] min-h-[320px] sm:min-h-[370px] transition-colors duration-300"
          style={{
            background: `linear-gradient(110deg, ${heroTheme.bg} 0%, ${heroTheme.bg} 44%, ${heroTheme.edge} 100%)`,
            color: heroTheme.text,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none feature-texture-soft"
          />

          <div
            aria-hidden="true"
            className="relative sm:absolute sm:top-0 sm:bottom-0 sm:right-0 w-full sm:w-[52%] h-[180px] sm:h-full flex items-center justify-center pointer-events-none mt-2 sm:mt-0"
          >
            <img
              src={activeHero.bannerUrl || heroTheme.defaultArt}
              alt=""
              width={960}
              height={540}
              fetchPriority="high"
              className="w-full h-full object-cover feature-art-mask"
            />
          </div>

          <div className="relative z-10 w-full sm:w-[56%] px-6 pb-8 pt-2 sm:py-10 sm:pl-10 lg:pl-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase" style={{ color: heroTheme.accent }}>
              <span>{activeHero.category}</span>
              {activeHero.latestRelease && (
                <span>· v{activeHero.latestRelease.versionName}</span>
              )}
            </div>

            <h1 className="mt-2.5 text-[2.25rem] sm:text-[3.2rem] lg:text-[4rem] font-extrabold leading-[1.03] tracking-[-0.055em]">
              {(() => {
                const [line1, line2] = splitTitleLines(activeHero.name);
                return (
                  <>
                    <span className="block">{line1}</span>{" "}
                    {line2 && (
                      <em className="block not-italic" style={{ color: heroTheme.accent }}>
                        {line2}
                      </em>
                    )}
                  </>
                );
              })()}
            </h1>

            <p
              className="mt-3 max-w-[420px] text-sm sm:text-base leading-relaxed font-medium"
              style={{ color: heroTheme.soft }}
            >
              {activeHero.tagline}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {activeHero.latestRelease ? (
                <a
                  href={`/api/releases/${activeHero.latestRelease.id}/download`}
                  style={{
                    backgroundColor: heroTheme.btnBg,
                    color: heroTheme.btnInk,
                  }}
                  className="min-h-11 px-5 inline-flex items-center justify-center gap-2 rounded-[10px] text-sm font-bold tactile-press hover:brightness-105"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 15.5v3A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
                  </svg>
                  <span>Unduh APK v{activeHero.latestRelease.versionName}</span>
                </a>
              ) : (
                <Link
                  href={`/apps/${activeHero.slug}`}
                  style={{
                    backgroundColor: heroTheme.btnBg,
                    color: heroTheme.btnInk,
                  }}
                  className="min-h-11 px-5 inline-flex items-center justify-center rounded-[10px] text-sm font-bold tactile-press"
                >
                  Lihat Detail
                </Link>
              )}

              <button
                type="button"
                onClick={() => setQuickViewApp(activeHero)}
                style={{
                  color: heroTheme.text,
                  borderColor: heroTheme.rule,
                }}
                className="min-h-11 px-4 inline-flex items-center justify-center rounded-[10px] border text-sm font-bold hover:bg-white/10 tactile-press"
              >
                Pratinjau Cepat
              </button>
            </div>
          </div>

          {featuredApps.length > 1 && (
            <div
              role="group"
              aria-label="Pilih aplikasi unggulan"
              className="absolute bottom-3 right-5 z-10 flex items-center gap-1"
            >
              {featuredApps.map((item, idx) => {
                const current = idx === heroIndex % featuredApps.length;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Tampilkan ${item.name}`}
                    aria-pressed={current}
                    className="w-7 h-8 grid place-items-center rounded-full"
                  >
                    <span
                      className="block h-1.5 rounded-full transition-all duration-200"
                      style={{
                        width: current ? 20 : 6,
                        backgroundColor: current ? heroTheme.accent : heroTheme.text,
                        opacity: current ? 1 : 0.55,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section id="catalog" aria-labelledby="catalog-heading" className={showHero ? "mt-8 sm:mt-11" : "mt-2"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <h2
              id="catalog-heading"
              tabIndex={-1}
              className="text-2xl sm:text-[2rem] font-extrabold tracking-[-0.045em] text-[#18221c]"
            >
              {isSavedView
                ? "Aplikasi tersimpan"
                : query
                ? `Hasil: ${query}`
                : "Katalog aplikasi"}
            </h2>
            <span
              aria-hidden="true"
              className="inline-grid place-items-center min-w-7 h-7 px-2 rounded-lg bg-[#e9eee6] border border-[#dfe5db] text-xs font-bold text-[#4b5a4f] tabular-nums"
            >
              {filteredApps.length}
            </span>
          </div>

          <div
            role="group"
            aria-label="Filter status rilis"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
          >
            {(
              [
                { value: "all", label: "Semua" },
                { value: "ready", label: "Siap unduh" },
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
                  className={`min-h-10 px-3.5 inline-flex items-center gap-1.5 rounded-full text-xs sm:text-[13px] font-semibold border whitespace-nowrap transition-colors tactile-press ${
                    active
                      ? "bg-[#1b2b20] border-[#1b2b20] text-white"
                      : "bg-white border-[#dde4da] text-[#435248] hover:bg-[#eff3e9]"
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {categories.length > 2 && (
          <div
            role="group"
            aria-label="Filter kategori"
            className="flex items-center gap-1.5 overflow-x-auto pb-4 no-scrollbar"
          >
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(cat)}
                  className={`min-h-9 px-3 rounded-lg text-xs font-semibold border whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#e9f4e9] border-[#006c4c] text-[#006a49]"
                      : "bg-transparent border-transparent text-[#52625a] hover:bg-[#eff4ec]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {filteredApps.length === 0 ? (
          <div className="rounded-[18px] border border-[#dce3da] bg-white px-6 py-12 grid justify-items-center text-center">
            <span className="w-12 h-12 rounded-[14px] bg-[#e9f1e5] text-[#2d6848] grid place-items-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {isSavedView && savedCount === 0 ? (
                  <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
                ) : (
                  <>
                    <circle cx="10.7" cy="10.7" r="6.9" />
                    <path d="m16 16 4.6 4.6" />
                  </>
                )}
              </svg>
            </span>
            <h3 className="text-lg font-bold text-[#18221c]">
              {isSavedView && savedCount === 0
                ? "Belum ada aplikasi tersimpan"
                : apps.length === 0
                ? "Belum ada aplikasi terdaftar"
                : "Aplikasi belum ketemu"}
            </h3>
            <p className="text-sm text-[#52625a] mt-1.5 max-w-md">
              {isSavedView && savedCount === 0
                ? "Ketuk ikon penanda di pojok kartu aplikasi yang ingin kamu unduh nanti."
                : apps.length === 0
                ? "Masuk ke Studio Console untuk menambahkan aplikasi Android pertama."
                : "Coba kata kunci lain atau reset filter untuk melihat semua rilis."}
            </p>
            <div className="mt-5">
              {apps.length === 0 ? (
                <Link
                  href="/dashboard"
                  className="min-h-11 px-5 inline-flex items-center rounded-[10px] bg-[#006c4c] text-white text-sm font-bold hover:bg-[#07543c] tactile-press"
                >
                  Buka Studio Console
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="min-h-11 px-5 inline-flex items-center rounded-[10px] bg-[#006c4c] text-white text-sm font-bold hover:bg-[#07543c] tactile-press"
                >
                  {isSavedView ? "Jelajahi aplikasi" : "Reset pencarian & filter"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredApps.map((app) => {
              const stage = getAppReleaseStage(app.latestRelease);
              const skinMeta = getSkinMeta(app.themeSkin);
              const isSaved = savedSet.has(app.slug);
              const coverSrc =
                app.bannerUrl ||
                app.screenshots[0] ||
                (HERO_THEME_VARS[app.themeSkin] ?? HERO_THEME_VARS.emerald).defaultArt;

              return (
                <article
                  key={app.id}
                  className="studio-card flex flex-col overflow-hidden"
                >
                  <div
                    className="relative aspect-[2.17] overflow-hidden"
                    style={{ backgroundColor: skinMeta.coverBg }}
                  >
                    <Link
                      href={`/apps/${app.slug}`}
                      aria-label={`Detail ${app.name}`}
                      className="block w-full h-full focus-visible:outline-offset-[-4px]"
                    >
                      <img
                        src={coverSrc}
                        alt=""
                        width={640}
                        height={295}
                        className="w-full h-full object-cover studio-card-image"
                      />
                    </Link>

                    <span
                      style={{
                        backgroundColor: skinMeta.statusBg,
                        color: skinMeta.statusInk,
                      }}
                      className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 min-h-6 px-2.5 py-1 rounded-[7px] border border-white/60 text-xs font-bold"
                    >
                      <StageIcon stage={stage} />
                      <span>{getStageLabel(stage)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleBookmark(app)}
                      aria-pressed={isSaved}
                      aria-label={
                        isSaved
                          ? `Hapus dari tersimpan ${app.name}`
                          : `Simpan ${app.name}`
                      }
                      title={isSaved ? "Hapus dari tersimpan" : "Simpan aplikasi"}
                      className={`absolute top-2.5 right-2.5 w-10 h-10 grid place-items-center rounded-full border transition-colors tactile-press ${
                        isSaved
                          ? "bg-[#203d2a] text-[#e1f68c] border-[#203d2a]"
                          : "bg-white/92 text-[#222c25] border-white/75 hover:bg-white shadow-[0_1px_3px_rgba(23,35,26,0.1)]"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.9"
                        aria-hidden="true"
                      >
                        <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 min-w-0">
                      <AppIcon
                        name={app.name}
                        iconUrl={app.iconUrl}
                        skin={app.themeSkin}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <h3 className="text-[1.1rem] sm:text-[1.18rem] font-extrabold tracking-[-0.03em] text-[#18221c] leading-snug truncate">
                          <Link
                            href={`/apps/${app.slug}`}
                            className="hover:text-[#006c4c] transition-colors"
                          >
                            {app.name}
                          </Link>
                        </h3>
                        <p className="text-xs font-medium text-[#52625a] truncate mt-0.5">
                          {app.category}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 mb-4 text-[14.5px] leading-relaxed text-[#435248] line-clamp-2">
                      {app.tagline}
                    </p>

                    <div className="mt-auto pt-3 border-t border-[#e8ece6] flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52625a] tabular-nums">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17.6 11.48c-.22 0-.42.08-.57.23a.8.8 0 0 0-.23.57v4.4a.8.8 0 0 0 .8.8.8.8 0 0 0 .8-.8v-4.4a.8.8 0 0 0-.8-.8Zm-11.2 0c-.22 0-.42.08-.57.23a.8.8 0 0 0-.23.57v4.4a.8.8 0 0 0 .8.8.8.8 0 0 0 .8-.8v-4.4a.8.8 0 0 0-.8-.8Zm8.4-4.72 1.07-1.85a.33.33 0 0 0-.12-.45.33.33 0 0 0-.45.12L14.2 6.46A6.47 6.47 0 0 0 12 6.08c-.78 0-1.52.14-2.2.38L8.7 4.58a.33.33 0 0 0-.45-.12.33.33 0 0 0-.12.45L9.2 6.76A5.63 5.63 0 0 0 6.4 11.6h11.2a5.63 5.63 0 0 0-2.8-4.84ZM9.7 9.6a.65.65 0 1 1 0-1.3.65.65 0 0 1 0 1.3Zm4.6 0a.65.65 0 1 1 0-1.3.65.65 0 0 1 0 1.3ZM7.6 12v5.4c0 .55.45 1 1 1h.8v2.2a.8.8 0 0 0 1.6 0v-2.2h2v2.2a.8.8 0 0 0 1.6 0v-2.2h.8c.55 0 1-.45 1-1V12H7.6Z" />
                        </svg>
                        <span>
                          {app.latestRelease
                            ? `Android · v${app.latestRelease.versionName}`
                            : "Android"}
                        </span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickViewApp(app)}
                          className="min-h-10 px-3 inline-flex items-center rounded-[8px] border border-[#d6e3d7] bg-[#f2f7ef] text-xs font-bold text-[#1e6344] hover:bg-[#e3eedf] tactile-press"
                        >
                          Detail
                        </button>
                        {app.latestRelease && (
                          <a
                            href={`/api/releases/${app.latestRelease.id}/download`}
                            className="min-h-10 px-3 inline-flex items-center gap-1.5 rounded-[8px] bg-[#056c4b] text-xs font-bold text-white hover:bg-[#07583f] tactile-press"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 15.5v3A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
                            </svg>
                            <span>Unduh</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside
        aria-labelledby="install-heading"
        className="mt-8 sm:mt-11 mb-6 rounded-2xl border border-[#d5e5d1] bg-[#eaf2e6] px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <span className="w-11 h-11 rounded-[13px] bg-[#deebd5] text-[#2d6848] grid place-items-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="6.3" y="2.5" width="11.4" height="19" rx="2.7" />
            <path d="M10.5 5h3m-2.1 13.7h1.2" />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 id="install-heading" className="text-base font-bold text-[#263e2c]">
            Pertama kali pasang APK?
          </h2>
          <p className="text-sm text-[#4a604f] mt-0.5">
            Ikuti panduan singkat untuk memasang aplikasi Android prarilis di perangkat kamu.
          </p>
        </div>
        <Link
          href="/panduan"
          className="sm:ml-auto min-h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#bfd3bc] bg-[#f8fbf4] text-sm font-bold text-[#254f34] hover:bg-[#e3eedf] shrink-0 tactile-press"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 6.4C9.5 4.6 6.6 4.2 3 5.1v13.6c3.8-.9 6.8-.3 9 1.3 2.2-1.6 5.2-2.2 9-1.3V5.1c-3.6-.9-6.5-.5-9 1.3zm0 0V20" />
          </svg>
          <span>Buka panduan</span>
        </Link>
      </aside>

      {quickViewApp && (
        <QuickViewDialog
          app={quickViewApp}
          isSaved={savedSet.has(quickViewApp.slug)}
          onToggleSave={() => handleBookmark(quickViewApp)}
          onClose={() => setQuickViewApp(null)}
        />
      )}

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed z-40 bottom-20 sm:bottom-6 left-1/2 max-w-[calc(100%-32px)] px-4 py-2.5 rounded-xl bg-[#203729] text-white text-sm font-medium shadow-[0_7px_22px_rgba(19,37,29,0.2)] animate-toast-in pointer-events-none"
        >
          {toastMsg}
        </div>
      )}
    </main>
  );
}

function QuickViewDialog({
  app,
  isSaved,
  onToggleSave,
  onClose,
}: {
  app: AppWithLatestRelease;
  isSaved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}) {
  const stage = getAppReleaseStage(app.latestRelease);
  const skinMeta = getSkinMeta(app.themeSkin);
  const coverSrc =
    app.bannerUrl ||
    app.screenshots[0] ||
    (HERO_THEME_VARS[app.themeSkin] ?? HERO_THEME_VARS.emerald).defaultArt;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#0e2018]/65 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-[520px] max-h-[90dvh] overflow-y-auto rounded-t-[22px] sm:rounded-[22px] bg-white text-[#18221c] shadow-[0_24px_90px_rgba(8,23,13,0.26)] animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pratinjau"
          className="absolute top-3.5 right-3.5 z-10 w-10 h-10 grid place-items-center rounded-full border border-white/75 bg-white/92 text-[#222c25] hover:bg-white shadow"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 6 12 12m0-12L6 18" />
          </svg>
        </button>

        <div
          className="relative aspect-[2.6] overflow-hidden"
          style={{ backgroundColor: skinMeta.coverBg }}
        >
          <img
            src={coverSrc}
            alt=""
            width={960}
            height={370}
            className="w-full h-full object-cover"
          />
          <span
            style={{
              backgroundColor: skinMeta.statusBg,
              color: skinMeta.statusInk,
            }}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 min-h-6 px-2.5 py-1 rounded-[7px] border border-white/60 text-xs font-bold"
          >
            <StageIcon stage={stage} />
            <span>{getStageLabel(stage)}</span>
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3.5">
            <AppIcon
              name={app.name}
              iconUrl={app.iconUrl}
              skin={app.themeSkin}
              size="md"
            />
            <div className="min-w-0">
              <h2 id="quickview-title" className="text-xl font-extrabold tracking-[-0.03em] text-[#18221c]">
                {app.name}
              </h2>
              <p className="text-xs font-medium text-[#52625a]">
                {app.category} · {app.developerName}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-[#45554c]">
            {app.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 rounded-[11px] bg-[#f4f6f1] px-4 py-3.5">
            <div>
              <dt className="text-xs text-[#5a695f]">Platform</dt>
              <dd className="mt-0.5 text-sm font-bold text-[#18221c]">
                {app.minAndroid}
              </dd>
            </div>
            <div className="pl-4 border-l border-[#dbe3d8]">
              <dt className="text-xs text-[#5a695f]">Versi APK</dt>
              <dd className="mt-0.5 text-sm font-bold text-[#18221c] tabular-nums">
                {app.latestRelease
                  ? `v${app.latestRelease.versionName} (${app.latestRelease.fileSizeLabel})`
                  : "Belum dirilis"}
              </dd>
            </div>
          </dl>

          {app.features && app.features.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold text-[#18221c]">Fitur aplikasi</h3>
              <ul className="mt-2.5 space-y-1.5 text-sm text-[#425248]">
                {app.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#287552"
                      strokeWidth="2.2"
                      aria-hidden="true"
                      className="mt-1 shrink-0"
                    >
                      <path d="m4.5 12 5 5L19.8 6.8" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {app.testerNote && (
            <div className="mt-4 rounded-[10px] border border-[#e1e9dc] bg-[#eff5eb] px-3.5 py-2.5 flex items-start gap-2 text-xs sm:text-sm text-[#3c5543]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8.5h.01" />
              </svg>
              <span>{app.testerNote}</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {app.latestRelease && (
              <a
                href={`/api/releases/${app.latestRelease.id}/download`}
                className="min-h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#006c4c] text-white text-sm font-bold hover:bg-[#07543c] tactile-press"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 3.5v11m-4-4 4 4 4-4M4.5 15.5v3A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
                </svg>
                <span>Unduh APK v{app.latestRelease.versionName}</span>
              </a>
            )}

            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={isSaved}
              className={`min-h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[10px] border text-sm font-bold tactile-press ${
                isSaved
                  ? "bg-[#203d2a] text-[#e1f68c] border-[#203d2a]"
                  : "bg-white border-[#cbd8cc] text-[#355d42] hover:bg-[#f0f5ed]"
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
              </svg>
              <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
            </button>

            <Link
              href={`/apps/${app.slug}`}
              className="min-h-11 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#dce3da] bg-[#f7f8f5] text-sm font-bold text-[#18221c] hover:border-[#006c4c] hover:text-[#006c4c]"
            >
              Riwayat &amp; QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
