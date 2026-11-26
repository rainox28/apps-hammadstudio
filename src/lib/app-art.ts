import type { ReleaseStage } from "./constants";

const DEFAULT_ART: Record<string, string> = {
  emerald: "/artwork/heroMobile.webp",
  amber: "/artwork/martaboy.webp",
  sky: "/artwork/wisata.webp",
  plum: "/artwork/mobile.webp",
};

interface ArtSource {
  bannerUrl: string | null;
  iconUrl: string | null;
  screenshots: string[];
  themeSkin: string;
}

/** Wide artwork for banners and cards: banner, first screenshot, then the skin's preset. */
export function getCoverSrc(app: ArtSource): string {
  return app.bannerUrl || app.screenshots[0] || DEFAULT_ART[app.themeSkin] || DEFAULT_ART.emerald;
}

/** Square tile image: the uploaded icon, else the cover cropped square. */
export function getTileSrc(app: ArtSource): string {
  return app.iconUrl || getCoverSrc(app);
}

export function getStageLabel(stage: ReleaseStage): string {
  if (stage === "ready") return "Siap";
  if (stage === "beta") return "Beta";
  return "Segera";
}
