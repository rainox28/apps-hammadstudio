"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScreenshotGalleryProps {
  appName: string;
  screenshots: string[];
}

export function ScreenshotGallery({ appName, screenshots }: ScreenshotGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % screenshots.length
        );
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev === null ? null : (prev - 1 + screenshots.length) % screenshots.length
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, screenshots.length]);

  function scrollByDirection(dir: -1 | 1) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  if (screenshots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#C8D3CC] bg-[#F5F7F6] px-5 py-8 text-center">
        <p className="text-sm font-medium text-[#141917]">
          Belum ada tangkapan layar
        </p>
        <p className="text-xs text-[#49544E] mt-1">
          Pengelola dapat menambahkan pratinjau layar aplikasi melalui Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-[#141917]">
          Tangkapan Layar
        </h2>
        {screenshots.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              aria-label="Geser tangkapan layar ke kiri"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-[#E4EAE6] bg-white text-sm font-medium text-[#141917] hover:bg-[#F5F7F6]"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              aria-label="Geser tangkapan layar ke kanan"
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border border-[#E4EAE6] bg-white text-sm font-medium text-[#141917] hover:bg-[#F5F7F6]"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory no-scrollbar"
      >
        {screenshots.map((url, idx) => (
          <button
            key={`${url}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Perbesar tangkapan layar ${idx + 1} dari ${appName}`}
            className="shrink-0 snap-start rounded-xl overflow-hidden border border-[#E4EAE6] bg-[#F5F7F6] hover:border-[#017A56] transition-colors tactile-press"
          >
            <img
              src={url}
              alt={`Tangkapan layar ${idx + 1} aplikasi ${appName}`}
              width={220}
              height={390}
              className="h-72 sm:h-80 w-auto object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && screenshots[activeIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau tangkapan layar ${activeIndex + 1}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141917]/80"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative max-w-2xl w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-white">
              <span className="text-sm font-medium">
                Tangkapan layar {activeIndex + 1} / {screenshots.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="min-h-11 px-4 rounded-lg bg-white text-[#141917] text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
            <img
              src={screenshots[activeIndex]}
              alt={`Tangkapan layar penuh ${activeIndex + 1} dari ${appName}`}
              width={540}
              height={960}
              className="max-h-[78dvh] w-auto rounded-xl border border-white/20 bg-white object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
