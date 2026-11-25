import React from "react";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 34, className = "" }: BrandLogoProps) {
  return (
    <img
      src="/brand-logo.png"
      alt="Logo apps.hammad.studio"
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] object-cover border border-[#E2E8E5] bg-[#0D1513] ${className}`}
    />
  );
}
