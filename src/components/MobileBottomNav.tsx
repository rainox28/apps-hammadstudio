"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSavedApps } from "@/lib/saved-apps";

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export function MobileBottomNav({ isAuthenticated = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { savedCount } = useSavedApps();

  const isSavedView = pathname === "/" && searchParams.get("view") === "tersimpan";
  const isExplore = pathname === "/" && !isSavedView;

  return (
    <nav
      aria-label="Navigasi seluler"
      className="sm:hidden fixed z-20 bottom-0 left-0 right-0 flex items-stretch justify-evenly px-1.5 pt-1 pb-[max(4px,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-line"
    >
      <Link
        href="/"
        className={`relative min-w-[23%] min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-[12px] text-[11px] font-medium ${
          isExplore ? "text-accent bg-accent-soft font-semibold" : "text-ink-2"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
        </svg>
        <span>Jelajahi</span>
      </Link>

      <Link
        href="/?view=tersimpan"
        className={`relative min-w-[23%] min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-[12px] text-[11px] font-medium ${
          isSavedView ? "text-accent bg-accent-soft font-semibold" : "text-ink-2"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
        </svg>
        <span>Tersimpan</span>
        {savedCount > 0 && (
          <span
            aria-label={`${savedCount} aplikasi tersimpan`}
            className="absolute top-1.5 left-[calc(50%+10px)] w-2 h-2 rounded-full bg-accent"
          />
        )}
      </Link>

      <Link
        href="/panduan"
        className={`relative min-w-[23%] min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-[12px] text-[11px] font-medium ${
          pathname === "/panduan" ? "text-accent bg-accent-soft font-semibold" : "text-ink-2"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 6.4C9.5 4.6 6.6 4.2 3 5.1v13.6c3.8-.9 6.8-.3 9 1.3 2.2-1.6 5.2-2.2 9-1.3V5.1c-3.6-.9-6.5-.5-9 1.3zm0 0V20" />
        </svg>
        <span>Panduan</span>
      </Link>

      <Link
        href={isAuthenticated ? "/dashboard" : "/login"}
        className={`relative min-w-[23%] min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-[12px] text-[11px] font-medium ${
          pathname.startsWith("/dashboard") || pathname === "/login"
            ? "text-accent bg-accent-soft font-semibold"
            : "text-ink-2"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
        <span>Admin</span>
      </Link>
    </nav>
  );
}
