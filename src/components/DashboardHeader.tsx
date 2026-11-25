"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  userEmail: string;
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
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
    <header className="sticky top-0 z-30 bg-white border-b border-[#E4EAE6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-h-11 font-bold text-[#141917] text-sm sm:text-base truncate"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect width="28" height="28" rx="7" fill="#017A56" />
              <path d="M9.5 7.5L21 14L9.5 20.5V7.5Z" fill="#FFFFFF" />
            </svg>
            <span className="truncate">Studio Console</span>
          </Link>
          <span className="hidden md:inline-block text-xs text-[#49544E] border-l border-[#E4EAE6] pl-3 truncate">
            {userEmail}
          </span>
        </div>

        <nav aria-label="Navigasi dashboard" className="flex items-center gap-2">
          <Link
            href="/"
            className="min-h-11 px-3 inline-flex items-center rounded-lg text-xs sm:text-sm font-semibold text-[#49544E] hover:bg-[#F5F7F6] hover:text-[#141917]"
          >
            Lihat Store
          </Link>
          <Link
            href="/dashboard/apps/new"
            className="min-h-11 px-3.5 sm:px-4 inline-flex items-center rounded-lg bg-[#017A56] text-white text-xs sm:text-sm font-semibold hover:bg-[#016346] tactile-press"
          >
            Tambah Aplikasi
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="min-h-11 px-3 inline-flex items-center rounded-lg border border-[#C8D3CC] bg-white text-xs sm:text-sm font-semibold text-[#141917] hover:bg-[#F5F7F6] disabled:opacity-60"
          >
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </nav>
      </div>
    </header>
  );
}
