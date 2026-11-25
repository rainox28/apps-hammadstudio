"use client";

import React, { useState } from "react";

interface CopyTextButtonProps {
  value: string;
  label: string;
  copiedLabel?: string;
  relativePath?: boolean;
  className?: string;
}

export function CopyTextButton({
  value,
  label,
  copiedLabel = "Tersalin",
  relativePath = false,
  className = "",
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const textToCopy =
      relativePath && typeof window !== "undefined" && !value.startsWith("http")
        ? `${window.location.origin}${value}`
        : value;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`tactile-press ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
