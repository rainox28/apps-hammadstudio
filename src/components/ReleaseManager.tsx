"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RELEASE_TRACKS } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import { TrackBadge } from "@/components/TrackBadge";
import type { AppRelease } from "@/db/schema";

interface ReleaseManagerProps {
  appId: number;
  releases: AppRelease[];
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function ReleaseManager({ appId, releases }: ReleaseManagerProps) {
  const router = useRouter();

  const nextCode =
    releases.length > 0
      ? Math.max(...releases.map((r) => r.versionCode)) + 1
      : 1;

  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState(String(nextCode));
  const [track, setTrack] = useState("beta");
  const [apkUrl, setApkUrl] = useState("");
  const [fileSizeLabel, setFileSizeLabel] = useState("");
  const [sha256, setSha256] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [isLatest, setIsLatest] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const { startUpload: uploadApk, isUploading: isUploadingApk } =
    useUploadThing("apkRelease", {
      onClientUploadComplete: (res) => {
        const uploaded = res?.[0];
        if (uploaded?.ufsUrl) {
          setApkUrl(uploaded.ufsUrl);
          if (uploaded.size) {
            setFileSizeLabel(formatFileSize(uploaded.size));
          }
          setUploadStatus("File APK berhasil diunggah ke UploadThing.");
        }
      },
      onUploadError: (err) => {
        setError(`Gagal mengunggah APK: ${err.message}`);
        setUploadStatus(null);
      },
    });

  async function handleApkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadStatus(`Mengunggah ${file.name}...`);
    await uploadApk([file]);
    e.target.value = "";
  }

  async function handleAddRelease(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/apps/${appId}/releases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionName,
          versionCode: Number(versionCode),
          track,
          apkUrl,
          fileSizeLabel: fileSizeLabel || "APK",
          sha256: sha256 || null,
          releaseNotes,
          isLatest,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambahkan rilis APK.");
        setSubmitting(false);
        return;
      }

      setVersionName("");
      setVersionCode(String(Number(versionCode) + 1));
      setApkUrl("");
      setFileSizeLabel("");
      setSha256("");
      setReleaseNotes("");
      setUploadStatus(null);
      setSuccessMsg(`Rilis v${data.release.versionName} berhasil ditambahkan.`);
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
      setSubmitting(false);
    }
  }

  async function handleSetLatest(releaseId: number) {
    setError(null);
    const res = await fetch(`/api/releases/${releaseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLatest: true }),
    });
    if (!res.ok) {
      setError("Gagal memperbarui rilis terbaru.");
      return;
    }
    router.refresh();
  }

  async function handleDeleteRelease(releaseId: number) {
    setError(null);
    const res = await fetch(`/api/releases/${releaseId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Gagal menghapus rilis.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] border border-line bg-white p-5 sm:p-7">
        <h2 className="text-base sm:text-lg font-semibold text-ink">
          Tambah rilis APK
        </h2>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          Tempel tautan langsung file .apk (seperti storage server Anda) atau unggah file .apk lewat UploadThing.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
          >
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mt-4 rounded-[12px] bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
          >
            {successMsg}
          </div>
        )}

        {uploadStatus && !error && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-line bg-raised px-4 py-2.5 text-xs font-medium text-ink"
          >
            {uploadStatus}
          </div>
        )}

        <form onSubmit={handleAddRelease} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="rel-version-name"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Nama versi
              </label>
              <input
                id="rel-version-name"
                type="text"
                required
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="0.7.1"
                className="w-full h-11 px-3.5 rounded-xl border border-line-strong text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rel-version-code"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Kode versi
              </label>
              <input
                id="rel-version-code"
                type="number"
                required
                min={1}
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-line-strong text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rel-track"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Jalur rilis
              </label>
              <select
                id="rel-track"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-line-strong bg-white text-sm text-ink focus:border-accent focus:outline-none"
              >
                {RELEASE_TRACKS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="rel-apk-url"
                className="text-sm font-semibold text-ink"
              >
                URL file APK
              </label>
              <label
                htmlFor="rel-apk-upload"
                className="min-h-9 px-3 inline-flex items-center rounded-lg border border-line-strong bg-raised text-xs font-semibold text-ink hover:border-accent"
              >
                {isUploadingApk ? "Mengunggah APK..." : "Atau Unggah .apk"}
              </label>
              <input
                id="rel-apk-upload"
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                disabled={isUploadingApk}
                onChange={handleApkFileChange}
                className="sr-only"
              />
            </div>
            <input
              id="rel-apk-url"
              type="url"
              required
              value={apkUrl}
              onChange={(e) => setApkUrl(e.target.value)}
              placeholder="https://martabak.hammad.studio/storage/releases/app-v0.7.0.apk"
              className="w-full h-11 px-3.5 rounded-xl border border-line-strong text-sm font-mono text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rel-size"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                Label ukuran file
              </label>
              <input
                id="rel-size"
                type="text"
                required
                value={fileSizeLabel}
                onChange={(e) => setFileSizeLabel(e.target.value)}
                placeholder="24.5 MB"
                className="w-full h-11 px-3.5 rounded-xl border border-line-strong text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rel-sha"
                className="block text-sm font-semibold text-ink mb-1.5"
              >
                SHA-256 Checksum (opsional)
              </label>
              <input
                id="rel-sha"
                type="text"
                value={sha256}
                onChange={(e) => setSha256(e.target.value)}
                placeholder="Opsional untuk verifikasi integritas"
                className="w-full h-11 px-3.5 rounded-xl border border-line-strong text-sm font-mono text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rel-notes"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              Catatan Rilis (What&apos;s New)
            </label>
            <textarea
              id="rel-notes"
              required
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Perbaikan bug atau fitur baru di versi ini..."
              className="w-full p-3.5 rounded-xl border border-line-strong text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <label
            htmlFor="rel-is-latest"
            className="flex items-center gap-2.5 min-h-11 text-sm font-medium text-ink"
          >
            <input
              id="rel-is-latest"
              type="checkbox"
              checked={isLatest}
              onChange={(e) => setIsLatest(e.target.checked)}
              className="w-4 h-4 accent-[#017A56]"
            />
            <span>Jadikan sebagai versi unduhan utama (Terbaru)</span>
          </label>

          <button
            type="submit"
            disabled={submitting || isUploadingApk}
            className="min-h-11 px-6 rounded-full bg-night text-white text-sm font-bold hover:bg-accent-hover disabled:opacity-60 tactile-press"
          >
            {submitting ? "Menambahkan Rilis..." : "Publikasikan Rilis APK"}
          </button>
        </form>
      </section>

      <section className="rounded-[16px] border border-line bg-white p-5 sm:p-7">
        <h3 className="text-base font-semibold text-ink">
          Daftar Versi Terunggah ({releases.length})
        </h3>
        {releases.length === 0 ? (
          <p className="text-sm text-ink-2 mt-2">
            Belum ada rilis APK untuk aplikasi ini. Tambahkan rilis pertama di formulir atas.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {releases.map((rel) => (
              <div
                key={rel.id}
                className="rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-ink">
                      v{rel.versionName}
                    </span>
                    <span className="text-xs font-mono text-ink-2">
                      code {rel.versionCode}
                    </span>
                    <TrackBadge track={rel.track} />
                    {rel.isLatest && (
                      <span className="text-xs font-semibold text-accent">
                        Terbaru
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-2 mt-1">
                    {rel.fileSizeLabel} · {rel.downloadCount} unduhan
                  </p>
                  <p className="text-xs font-mono text-ink-2 truncate mt-1">
                    {rel.apkUrl}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!rel.isLatest && (
                    <button
                      type="button"
                      onClick={() => handleSetLatest(rel.id)}
                      className="min-h-11 px-3 rounded-lg border border-line-strong text-xs font-semibold text-ink hover:border-accent hover:text-accent"
                    >
                      Jadikan terbaru
                    </button>
                  )}
                  <a
                    href={`/api/releases/${rel.id}/download`}
                    className="min-h-11 px-3 inline-flex items-center rounded-lg border border-line text-xs font-semibold text-ink hover:bg-raised"
                  >
                    Unduh
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteRelease(rel.id)}
                    className="min-h-11 px-3 rounded-lg text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
