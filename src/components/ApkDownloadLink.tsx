"use client";

import React from "react";

interface ApkDownloadLinkProps {
  releaseId: number;
  apkUrl: string;
  className?: string;
  children: React.ReactNode;
}

export function ApkDownloadLink({
  releaseId,
  apkUrl,
  className = "",
  children,
}: ApkDownloadLinkProps) {
  function trackDownload() {
    const endpoint = `/api/releases/${releaseId}/download`;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon(endpoint);
        return;
      }
      fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
    } catch {
      // Never block direct APK download if telemetry fails.
    }
  }

  return (
    <a
      href={apkUrl}
      download
      onClick={trackDownload}
      className={className}
    >
      {children}
    </a>
  );
}
