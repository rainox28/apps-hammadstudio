"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeModalProps {
  appName: string;
  versionName: string;
  downloadPath: string;
}

export function QrCodeModal({ appName, versionName, downloadPath }: QrCodeModalProps) {
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
        className="min-h-11 px-4 inline-flex items-center justify-center gap-2 rounded-lg border border-[#C8D3CC] bg-white text-sm font-semibold text-[#141917] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 20h3M20 14v3" />
        </svg>
        <span>Scan QR di HP</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141917]/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white border border-[#E4EAE6] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="qr-modal-title" className="text-lg font-bold text-[#141917]">
                  Unduh di Perangkat Android
                </h2>
                <p className="text-sm text-[#49544E] mt-0.5">
                  {appName} v{versionName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup dialog QR"
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-[#49544E] hover:bg-[#F5F7F6] hover:text-[#141917]"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <div className="p-3 rounded-xl border border-[#E4EAE6] bg-white">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code untuk mengunduh ${appName}`}
                    width={220}
                    height={220}
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-sm text-[#49544E]">
                    Membuat QR...
                  </div>
                )}
              </div>
              <p className="text-xs text-[#49544E] text-center mt-3">
                Arahkan kamera ponsel Android ke kode QR di atas untuk membuka tautan unduhan APK.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullUrl}
                aria-label="Tautan unduhan langsung"
                className="flex-1 min-w-0 h-11 px-3 text-xs font-mono bg-[#F5F7F6] border border-[#E4EAE6] rounded-lg text-[#141917]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="h-11 px-4 rounded-lg bg-[#017A56] text-white text-xs font-semibold hover:bg-[#016346] tactile-press shrink-0"
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
