"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "./BrandLogo";

interface StoreHeaderProps {
  isAuthenticated?: boolean;
}

export function StoreHeader({ isAuthenticated = false }: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  function submitSearch(rawQuery: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = rawQuery.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
    setMobileMenuOpen(false);
  }

  const isCatalog = pathname === "/" || pathname.startsWith("/apps/");

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8E5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 min-h-11 py-1 text-[#111815] font-bold tracking-tight text-base sm:text-lg"
          >
            <BrandLogo size={34} />
            <span className="truncate">apps.hammad.studio</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden sm:flex items-center gap-1 h-16">
            <Link
              href="/"
              className={`h-full px-3 inline-flex items-center text-sm font-semibold border-b-2 transition-colors ${
                isCatalog
                  ? "border-[#017A56] text-[#017A56]"
                  : "border-transparent text-[#48544E] hover:text-[#111815]"
              }`}
            >
              Aplikasi
            </Link>
            <Link
              href="/panduan"
              className={`h-full px-3 inline-flex items-center text-sm font-semibold border-b-2 transition-colors ${
                pathname === "/panduan"
                  ? "border-[#017A56] text-[#017A56]"
                  : "border-transparent text-[#48544E] hover:text-[#111815]"
              }`}
            >
              Panduan Pasang
            </Link>
          </nav>
        </div>

        <SearchInputForm
          key={`desktop-${urlQuery}`}
          initialQuery={urlQuery}
          inputId="desktop-store-search"
          placeholder="Cari aplikasi, kasir, atau package ID..."
          variant="desktop"
          onSubmitSearch={submitSearch}
        />

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className={`hidden sm:inline-flex min-h-10 px-4 items-center rounded-full text-sm font-semibold border transition-colors tactile-press ${
              pathname.startsWith("/dashboard")
                ? "bg-[#017A56] text-white border-[#017A56]"
                : "bg-[#F8FAF9] text-[#111815] border-[#C8D3CC] hover:border-[#017A56] hover:text-[#017A56]"
            }`}
          >
            {isAuthenticated ? "Studio Console" : "Masuk Admin"}
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-store-menu"
            className="sm:hidden min-h-11 min-w-11 px-3 inline-flex items-center justify-center rounded-xl border border-[#C8D3CC] text-sm font-semibold text-[#111815] hover:bg-[#F8FAF9]"
          >
            {mobileMenuOpen ? "Tutup" : "Menu"}
          </button>
        </div>
      </div>

      <div className="md:hidden border-t border-[#E2E8E5] px-4 py-2.5 bg-[#F8FAF9]">
        <SearchInputForm
          key={`mobile-${urlQuery}`}
          initialQuery={urlQuery}
          inputId="mobile-store-search"
          placeholder="Cari aplikasi..."
          variant="mobile"
          onSubmitSearch={submitSearch}
        />
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-store-menu"
          aria-label="Navigasi seluler"
          className="sm:hidden border-t border-[#E2E8E5] bg-white px-4 py-3 flex flex-col gap-1.5"
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3.5 flex items-center rounded-xl text-sm font-semibold text-[#111815] hover:bg-[#F8FAF9]"
          >
            Katalog Aplikasi
          </Link>
          <Link
            href="/panduan"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3.5 flex items-center rounded-xl text-sm font-semibold text-[#111815] hover:bg-[#F8FAF9]"
          >
            Panduan Pasang APK
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3.5 flex items-center rounded-xl text-sm font-semibold text-[#017A56] bg-[#E6F4EE]"
          >
            {isAuthenticated ? "Studio Console" : "Masuk Admin"}
          </Link>
        </nav>
      )}
    </header>
  );
}

function SearchInputForm({
  initialQuery,
  inputId,
  placeholder,
  variant,
  onSubmitSearch,
}: {
  initialQuery: string;
  inputId: string;
  placeholder: string;
  variant: "desktop" | "mobile";
  onSubmitSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmitSearch(value);
  }

  if (variant === "desktop") {
    return (
      <form
        onSubmit={handleSubmit}
        role="search"
        className="hidden md:flex flex-1 max-w-md items-center"
      >
        <label htmlFor={inputId} className="sr-only">
          Cari aplikasi atau package name
        </label>
        <div className="relative w-full flex items-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#48544E"
            strokeWidth="2"
            aria-hidden="true"
            className="absolute left-3.5 pointer-events-none"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id={inputId}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-10 pl-10 pr-20 text-sm bg-[#F8FAF9] border border-[#E2E8E5] rounded-full text-[#111815] placeholder:text-[#48544E] focus:bg-white focus:border-[#017A56] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1 h-8 px-3.5 rounded-full bg-[#017A56] text-white text-xs font-semibold hover:bg-[#016346] tactile-press"
          >
            Cari
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2">
      <label htmlFor={inputId} className="sr-only">
        Cari aplikasi
      </label>
      <div className="relative flex-1 min-w-0 flex items-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#48544E"
          strokeWidth="2"
          aria-hidden="true"
          className="absolute left-3.5 pointer-events-none"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-3 text-sm bg-white border border-[#E2E8E5] rounded-full text-[#111815] placeholder:text-[#48544E] focus:border-[#017A56] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="h-11 px-4 rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] tactile-press shrink-0"
      >
        Cari
      </button>
    </form>
  );
}
