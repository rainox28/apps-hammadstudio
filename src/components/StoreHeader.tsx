"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E4EAE6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 min-h-11 py-1 text-[#141917] font-bold tracking-tight text-base sm:text-lg"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="28" height="28" rx="7" fill="#017A56" />
            <path d="M9.5 7.5L21 14L9.5 20.5V7.5Z" fill="#FFFFFF" />
            <path d="M9.5 7.5L15.2 14L9.5 20.5V7.5Z" fill="#A7E3CE" fillOpacity="0.45" />
          </svg>
          <span>apps.hammad.studio</span>
        </Link>

        <SearchInputForm
          key={`desktop-${urlQuery}`}
          initialQuery={urlQuery}
          inputId="desktop-store-search"
          placeholder="Cari aplikasi, kasir, atau package name..."
          variant="desktop"
          onSubmitSearch={submitSearch}
        />

        <nav aria-label="Navigasi utama" className="hidden sm:flex items-center gap-1">
          <Link
            href="/"
            className={`min-h-11 px-3.5 inline-flex items-center rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-[#017A56] bg-[#E6F4EE]"
                : "text-[#49544E] hover:text-[#141917] hover:bg-[#F5F7F6]"
            }`}
          >
            Katalog
          </Link>
          <Link
            href="/panduan"
            className={`min-h-11 px-3.5 inline-flex items-center rounded-lg text-sm font-medium transition-colors ${
              pathname === "/panduan"
                ? "text-[#017A56] bg-[#E6F4EE]"
                : "text-[#49544E] hover:text-[#141917] hover:bg-[#F5F7F6]"
            }`}
          >
            Panduan Pasang
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className={`min-h-11 px-4 ml-1 inline-flex items-center rounded-lg text-sm font-semibold border transition-colors tactile-press ${
              pathname.startsWith("/dashboard")
                ? "bg-[#017A56] text-white border-[#017A56]"
                : "bg-white text-[#141917] border-[#C8D3CC] hover:border-[#017A56] hover:text-[#017A56]"
            }`}
          >
            {isAuthenticated ? "Dashboard" : "Masuk Admin"}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-store-menu"
          className="sm:hidden min-h-11 min-w-11 px-3 inline-flex items-center justify-center rounded-lg border border-[#C8D3CC] text-sm font-semibold text-[#141917] hover:bg-[#F5F7F6]"
        >
          {mobileMenuOpen ? "Tutup" : "Menu"}
        </button>
      </div>

      <div className="md:hidden border-t border-[#E4EAE6] px-4 py-2.5 bg-white">
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
          className="sm:hidden border-t border-[#E4EAE6] bg-white px-4 py-3 flex flex-col gap-1.5"
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3 flex items-center rounded-lg text-sm font-medium text-[#141917] hover:bg-[#F5F7F6]"
          >
            Katalog Aplikasi
          </Link>
          <Link
            href="/panduan"
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3 flex items-center rounded-lg text-sm font-medium text-[#141917] hover:bg-[#F5F7F6]"
          >
            Panduan Pasang APK
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            onClick={() => setMobileMenuOpen(false)}
            className="min-h-11 px-3 flex items-center rounded-lg text-sm font-semibold text-[#017A56] bg-[#E6F4EE]"
          >
            {isAuthenticated ? "Dashboard Pengelola" : "Masuk Admin"}
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
          <input
            id={inputId}
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 pl-4 pr-20 text-sm bg-[#F5F7F6] border border-[#E4EAE6] rounded-full text-[#141917] placeholder:text-[#49544E] focus:bg-white focus:border-[#017A56] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 h-8 px-3.5 rounded-full bg-[#017A56] text-white text-xs font-semibold hover:bg-[#016346] tactile-press"
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
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-11 px-4 text-sm bg-[#F5F7F6] border border-[#E4EAE6] rounded-full text-[#141917] placeholder:text-[#49544E] focus:bg-white focus:border-[#017A56] focus:outline-none"
      />
      <button
        type="submit"
        className="h-11 px-4 rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] tactile-press shrink-0"
      >
        Cari
      </button>
    </form>
  );
}
