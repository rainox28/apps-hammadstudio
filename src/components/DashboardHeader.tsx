"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";

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
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8E5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 min-h-11 font-bold text-[#111815] text-sm sm:text-base truncate"
          >
            <BrandLogo size={32} />
            <span className="truncate">Studio Console</span>
          </Link>
          <span className="hidden md:inline-block text-xs text-[#48544E] border-l border-[#E2E8E5] pl-3 truncate">
            {userEmail}
          </span>
        </div>

        <nav aria-label="Navigasi dashboard" className="flex items-center gap-2">
          <Link
            href="/"
            className="min-h-10 px-3.5 inline-flex items-center rounded-full text-xs sm:text-sm font-semibold text-[#48544E] hover:bg-[#F8FAF9] hover:text-[#111815]"
          >
            Lihat Store
          </Link>
          <Link
            href="/dashboard/apps/new"
            className="min-h-10 px-4 inline-flex items-center rounded-full bg-[#017A56] text-white text-xs sm:text-sm font-semibold hover:bg-[#016346] tactile-press"
          >
            Tambah Aplikasi
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="min-h-10 px-3.5 inline-flex items-center rounded-full border border-[#C8D3CC] bg-white text-xs sm:text-sm font-semibold text-[#111815] hover:bg-[#F8FAF9] disabled:opacity-60"
          >
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </nav>
      </div>
    </header>
  );
}
