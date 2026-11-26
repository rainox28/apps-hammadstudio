"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeModalProps {
  appName: string;
  versionName: string;
  downloadPath: string;
  tone?: "light" | "dark";
}

export function QrCodeModal({ appName, versionName, downloadPath, tone = "light" }: QrCodeModalProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [fullUrl, setFullUrl] = useState<string>(downloadPath);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    const origin = window.location.origin;
    const url = downloadPath.startsWith("http")
      ? downloadPath
      : `${origin}${downloadPath}`;
    setFullUrl(url);
    setOpen(true);
    QRCode.toDataURL(url, {
      width: 240,
      margin: 2,
      color: { dark: "#141917", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
        <button
        type="button"
        onClick={handleOpen}
        className={`min-h-12 px-5 inline-flex items-center justify-center gap-2 rounded-full border text-sm font-semibold tactile-press ${
          tone === "dark"
            ? "border-night-line text-white hover:border-night-mute"
            : "border-line-strong bg-white text-ink-2 hover:bg-raised"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h3M20 14v3" />
        </svg>
        <span>Kode QR</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-line p-6 shadow-xl animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="qr-modal-title" className="text-lg font-semibold text-ink">
                  Unduh di perangkat Android
                </h2>
                <p className="text-sm text-ink-2 mt-0.5">
                  {appName} v{versionName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup dialog QR"
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-raised hover:text-ink"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div className="p-3 rounded-xl border border-line bg-white">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code untuk mengunduh ${appName}`}
                    width={220}
                    height={220}
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-sm text-ink-2">
                    Membuat QR...
                  </div>
                )}
              </div>
              <p className="text-xs text-ink-2 text-center mt-3">
                Arahkan kamera ponsel Android ke kode QR di atas untuk membuka tautan unduhan APK.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                aria-label="Tautan unduhan langsung"
                className="flex-1 min-w-0 h-11 px-3 text-xs font-mono bg-raised border border-line rounded-lg text-ink"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="h-11 px-4 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover tactile-press shrink-0"
              >
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
