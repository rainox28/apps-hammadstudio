"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { useSavedApps } from "@/lib/saved-apps";

interface StoreHeaderProps {
  isAuthenticated?: boolean;
}

export function StoreHeader({ isAuthenticated = false }: StoreHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const activeView = searchParams.get("view") === "tersimpan" ? "tersimpan" : "jelajahi";
  const { savedCount } = useSavedApps();

  const isCatalog = pathname === "/" && activeView === "jelajahi";
  const isSavedView = pathname === "/" && activeView === "tersimpan";

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
  }

  return (
    <header className="sticky top-0 z-30 bg-[#fffffff5] border-b border-[#dce3da]">
      <div className="site-wrap min-h-[72px] flex items-center gap-4 lg:gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 shrink-0 min-h-11 text-[1.25rem] sm:text-[1.42rem] leading-none font-extrabold tracking-[-0.055em] text-[#18221c] whitespace-nowrap"
          aria-label="Studio Apps, beranda"
        >
          <BrandLogo size={36} />
          <span>
            Studio <span className="text-[#006c4c]">Apps</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] text-sm font-semibold whitespace-nowrap transition-colors ${
              isCatalog
                ? "text-[#006a49] bg-[#e9f4e9]"
                : "text-[#516159] hover:bg-[#eff4ec] hover:text-[#244934]"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
            </svg>
            <span>Jelajahi</span>
          </Link>

          <Link
            href="/?view=tersimpan"
            className={`inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] text-sm font-semibold whitespace-nowrap transition-colors ${
              isSavedView
                ? "text-[#006a49] bg-[#e9f4e9]"
                : "text-[#516159] hover:bg-[#eff4ec] hover:text-[#244934]"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v15l-6-4.1-6 4.1z" />
            </svg>
            <span>Tersimpan</span>
            {savedCount > 0 && (
              <span className="min-w-[18px] h-[18px] inline-grid place-items-center rounded-full bg-[#d7e9d5] text-[#296145] px-1 text-[11px] font-extrabold tabular-nums">
                {savedCount}
              </span>
            )}
          </Link>

          <Link
            href="/panduan"
            className={`inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] text-sm font-semibold whitespace-nowrap transition-colors ${
              pathname === "/panduan"
                ? "text-[#006a49] bg-[#e9f4e9]"
                : "text-[#516159] hover:bg-[#eff4ec] hover:text-[#244934]"
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 6.4C9.5 4.6 6.6 4.2 3 5.1v13.6c3.8-.9 6.8-.3 9 1.3 2.2-1.6 5.2-2.2 9-1.3V5.1c-3.6-.9-6.5-.5-9 1.3zm0 0V20" />
            </svg>
            <span>Panduan</span>
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 ml-auto min-w-0">
          <SearchInputForm
            key={urlQuery}
            initialQuery={urlQuery}
            onSubmitSearch={submitSearch}
          />

          <Link
            href="/panduan"
            title="Panduan instalasi APK"
            aria-label="Panduan instalasi APK"
            className="hidden sm:inline-flex md:hidden lg:inline-flex w-10 h-10 items-center justify-center rounded-full border border-[#dce3da] bg-white text-[#44574b] hover:bg-[#eff4ec] hover:text-[#244934] shrink-0"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 6.4C9.5 4.6 6.6 4.2 3 5.1v13.6c3.8-.9 6.8-.3 9 1.3 2.2-1.6 5.2-2.2 9-1.3V5.1c-3.6-.9-6.5-.5-9 1.3zm0 0V20" />
            </svg>
          </Link>

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="hidden sm:inline-flex min-h-10 px-4 items-center rounded-[10px] border border-[#dce3da] bg-[#f7f8f5] text-sm font-bold text-[#18221c] hover:border-[#006c4c] hover:text-[#006c4c] whitespace-nowrap tactile-press shrink-0"
          >
            {isAuthenticated ? "Studio Console" : "Masuk Admin"}
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchInputForm({
  initialQuery,
  onSubmitSearch,
}: {
  initialQuery: string;
  onSubmitSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const isTypingField = Boolean(
        target?.closest("input, textarea, select, [contenteditable]")
      );
      if (e.key === "/" && !isTypingField) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === inputRef.current) {
        if (value) {
          setValue("");
          onSubmitSearch("");
        } else {
          inputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [value, onSubmitSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmitSearch(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex items-center gap-2 min-w-0 w-[clamp(164px,32vw,272px)] min-h-[42px] px-3 border border-[#dfe5dd] rounded-[10px] bg-[#f7f8f5] text-[#657068] focus-within:border-[#75a98a] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(55,117,75,0.08)] transition-all"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="10.7" cy="10.7" r="6.9" />
        <path d="m16 16 4.6 4.6" />
      </svg>
      <label htmlFor="store-search-input" className="sr-only">
        Cari aplikasi
      </label>
      <input
        ref={inputRef}
        id="store-search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari aplikasi…"
        autoComplete="off"
        spellCheck={false}
        className="flex-1 w-0 min-w-0 bg-transparent border-0 outline-none text-sm text-[#18221c] placeholder:text-[#52625a]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            onSubmitSearch("");
            inputRef.current?.focus();
          }}
          aria-label="Hapus pencarian"
          className="w-7 h-7 inline-flex items-center justify-center rounded-[6px] text-[#52625a] hover:bg-[#eff4ec] hover:text-[#18221c]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 6 12 12m0-12L6 18" />
          </svg>
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="hidden sm:grid place-items-center h-[23px] min-w-[21px] border border-[#dce2d9] rounded-[5px] bg-white text-[#52625a] text-xs font-medium"
        >
          /
        </kbd>
      )}
    </form>
  );
}
