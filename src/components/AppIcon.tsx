import React from "react";
import { getSkinMeta } from "@/lib/constants";

interface AppIconProps {
  name: string;
  iconUrl?: string | null;
  skin?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "w-11 h-11 rounded-[12px] text-sm",
  md: "w-13 h-13 sm:w-14 sm:h-14 rounded-[14px] text-base",
  lg: "w-18 h-18 sm:w-20 sm:h-20 rounded-[20px] text-xl",
  xl: "w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] text-3xl",
} as const;

const SIZE_PX = {
  sm: 44,
  md: 56,
  lg: 80,
  xl: 112,
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppIcon({
  name,
  iconUrl,
  skin = "emerald",
  size = "md",
}: AppIconProps) {
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASSES[size];
  const skinMeta = getSkinMeta(skin);

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={`Ikon aplikasi ${name}`}
        width={px}
        height={px}
        className={`${sizeClass} shrink-0 object-cover border border-line bg-white shadow-[0_1px_2px_rgba(23,33,27,0.06)]`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: skinMeta.iconBg,
        color: skinMeta.iconInk,
      }}
      className={`${sizeClass} shrink-0 flex items-center justify-center border border-black/5 font-semibold tracking-[-0.02em] select-none shadow-[0_1px_2px_rgba(23,33,27,0.06)]`}
    >
      {getInitials(name)}
    </div>
  );
}
