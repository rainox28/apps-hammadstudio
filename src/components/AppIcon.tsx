import React from "react";

interface AppIconProps {
  name: string;
  iconUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "w-12 h-12 rounded-xl text-base",
  md: "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl text-lg",
  lg: "w-18 h-18 sm:w-20 sm:h-20 rounded-[20px] text-xl",
  xl: "w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] text-3xl",
} as const;

const SIZE_PX = {
  sm: 48,
  md: 64,
  lg: 80,
  xl: 112,
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppIcon({ name, iconUrl, size = "md" }: AppIconProps) {
  const px = SIZE_PX[size];
  const sizeClass = SIZE_CLASSES[size];

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={`Ikon aplikasi ${name}`}
        width={px}
        height={px}
        className={`${sizeClass} shrink-0 object-cover border border-[#E2E8E5] bg-[#F8FAF9] play-icon-elevation`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClass} shrink-0 flex items-center justify-center border border-[#C8D3CC] bg-[#E6F4EE] text-[#017A56] font-bold tracking-tight select-none play-icon-elevation`}
    >
      {getInitials(name)}
    </div>
  );
}
