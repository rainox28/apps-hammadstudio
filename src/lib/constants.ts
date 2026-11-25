export const APP_CATEGORIES = [
  "Bisnis & Kasir",
  "Produktivitas",
  "Utilitas",
  "Keuangan",
  "Komunikasi",
  "Lainnya",
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

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
