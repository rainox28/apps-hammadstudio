export const APP_CATEGORIES = [
  "Bisnis & Kasir",
  "Edukasi & Komunitas",
  "Produktivitas",
  "Utilitas",
  "Travel & Ibadah",
  "Keuangan",
  "Lainnya",
] as const;

export const APP_THEME_SKINS = [
  {
    value: "emerald",
    label: "Studio Emerald",
    coverBg: "#c8e6d8",
    statusBg: "#eaf7f0",
    statusInk: "#006c4c",
    iconBg: "#0a1414",
    iconInk: "#ffffff",
  },
  {
    value: "amber",
    label: "Warm Amber POS",
    coverBg: "#f8a264",
    statusBg: "#f4fae8",
    statusInk: "#315b29",
    iconBg: "#ffdfae",
    iconInk: "#77461c",
  },
  {
    value: "sky",
    label: "Sky Cyan",
    coverBg: "#78cfde",
    statusBg: "#effaff",
    statusInk: "#22586b",
    iconBg: "#d6f1ef",
    iconInk: "#14666d",
  },
  {
    value: "plum",
    label: "Studio Plum",
    coverBg: "#c9a4ef",
    statusBg: "#fbf5ff",
    statusInk: "#58377d",
    iconBg: "#f3e8ff",
    iconInk: "#4c1d95",
  },
] as const;

export type AppThemeSkin = (typeof APP_THEME_SKINS)[number]["value"];

export function getSkinMeta(skin: string) {
  return APP_THEME_SKINS.find((s) => s.value === skin) ?? APP_THEME_SKINS[0];
}

export const ARTWORK_PRESETS = [
  {
    label: "POS Kasir (Amber)",
    url: "/artwork/martaboy.webp",
    skin: "amber" as AppThemeSkin,
  },
  {
    label: "Handheld Retro (Emerald)",
    url: "/artwork/heroMobile.webp",
    skin: "emerald" as AppThemeSkin,
  },
  {
    label: "Controller Arcade (Plum)",
    url: "/artwork/mobile.webp",
    skin: "plum" as AppThemeSkin,
  },
  {
    label: "Travel Koper (Sky)",
    url: "/artwork/wisata.webp",
    skin: "sky" as AppThemeSkin,
  },
] as const;

export const RELEASE_TRACKS = [
  { value: "internal", label: "Internal", tone: "neutral" },
  { value: "alpha", label: "Alpha", tone: "amber" },
  { value: "beta", label: "Beta", tone: "amber" },
  { value: "rc", label: "Release Candidate", tone: "emerald" },
  { value: "production", label: "Production", tone: "emerald" },
] as const;

export type ReleaseTrack = (typeof RELEASE_TRACKS)[number]["value"];

export function getTrackMeta(track: string) {
  return (
    RELEASE_TRACKS.find((item) => item.value === track) ?? {
      value: "beta",
      label: track,
      tone: "neutral" as const,
    }
  );
}

export type ReleaseStage = "ready" | "beta" | "soon";

export function getAppReleaseStage(latestRelease: { track: string; apkUrl: string } | null): ReleaseStage {
  if (!latestRelease || !latestRelease.apkUrl) return "soon";
  if (latestRelease.track === "production" || latestRelease.track === "rc") return "ready";
  return "beta";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
