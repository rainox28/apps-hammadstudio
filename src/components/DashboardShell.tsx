"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";

interface DashboardShellProps {
  userEmail: string;
  children: React.ReactNode;
}

const NAV = [
  {
    href: "/dashboard",
    label: "Aplikasi",
    match: (p: string) => p === "/dashboard" || /^\/dashboard\/apps\/\d+/.test(p),
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    href: "/dashboard/apps/new",
    label: "Tambah aplikasi",
    match: (p: string) => p === "/dashboard/apps/new",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    href: "/",
    label: "Lihat store",
    match: () => false,
    icon: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  },
] as const;

export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-[#f6f8f5]">
      <aside className="md:w-[240px] md:shrink-0 bg-night text-white md:min-h-dvh">
        <div className="md:sticky md:top-0 flex md:flex-col md:h-dvh px-4 py-3 md:py-6 gap-1.5 items-center md:items-stretch overflow-x-auto no-scrollbar">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 md:pb-6 shrink-0 font-bold text-[17px] mr-2 md:mr-0">
            <BrandLogo size={30} />
            <span className="hidden sm:inline">Studio Apps</span>
          </Link>
          <nav aria-label="Navigasi dashboard" className="flex md:flex-col gap-1.5">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-11 px-3.5 inline-flex items-center gap-2.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    active
                      ? "bg-night-2 text-glow font-bold"
                      : "text-night-ink font-medium hover:bg-night-2 hover:text-white"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    {item.icon}
                  </svg>
                  <span className={item.href === "/" ? "hidden sm:inline" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto md:ml-0 md:mt-auto md:border-t md:border-night-line md:pt-4 md:px-2 flex md:flex-col items-center md:items-start gap-3 shrink-0">
            <span className="hidden md:block text-[13px] text-night-mute break-all">{userEmail}</span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="min-h-10 px-3 md:px-0 text-[13px] font-semibold text-white hover:text-glow disabled:opacity-60"
            >
              {loggingOut ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
