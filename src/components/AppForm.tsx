"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_CATEGORIES,
  APP_THEME_SKINS,
  ARTWORK_PRESETS,
  slugify,
} from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import { AppIcon } from "@/components/AppIcon";
import type { AppRecord } from "@/db/schema";

interface AppFormProps {
  mode: "create" | "edit";
  initialApp?: AppRecord;
}

export function AppForm({ mode, initialApp }: AppFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialApp?.name ?? "");
  const [slug, setSlug] = useState(initialApp?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [packageName, setPackageName] = useState(initialApp?.packageName ?? "");
  const [developerName, setDeveloperName] = useState(
    initialApp?.developerName ?? "Hammad Studio"
  );
  const [category, setCategory] = useState(
    initialApp?.category ?? APP_CATEGORIES[0]
  );
  const [themeSkin, setThemeSkin] = useState(
    initialApp?.themeSkin ?? "emerald"
  );
  const [minAndroid, setMinAndroid] = useState(
    initialApp?.minAndroid ?? "Android 8.0+"
  );
  const [tagline, setTagline] = useState(initialApp?.tagline ?? "");
  const [description, setDescription] = useState(initialApp?.description ?? "");
  const [featuresText, setFeaturesText] = useState(
    (initialApp?.features ?? []).join("\n")
  );
  const [testerNote, setTesterNote] = useState(initialApp?.testerNote ?? "");
  const [iconUrl, setIconUrl] = useState(initialApp?.iconUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(initialApp?.bannerUrl ?? "");
  const [screenshots, setScreenshots] = useState<string[]>(
    initialApp?.screenshots ?? []
  );
  const [isPublished, setIsPublished] = useState(
    initialApp?.isPublished ?? true
  );
  const [isFeatured, setIsFeatured] = useState(
    initialApp?.isFeatured ?? false
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const { startUpload: uploadIcon, isUploading: isUploadingIcon } =
    useUploadThing("appIcon", {
      onClientUploadComplete: (res) => {
        const uploaded = res?.[0];
        if (uploaded?.ufsUrl) {
          setIconUrl(uploaded.ufsUrl);
          setUploadMsg("Ikon aplikasi berhasil diunggah.");
        }
      },
      onUploadError: (err) => {
        setError(`Gagal unggah ikon: ${err.message}`);
      },
    });

  const { startUpload: uploadBanner, isUploading: isUploadingBanner } =
    useUploadThing("appBanner", {
      onClientUploadComplete: (res) => {
        const uploaded = res?.[0];
        if (uploaded?.ufsUrl) {
          setBannerUrl(uploaded.ufsUrl);
          setUploadMsg("Banner aplikasi berhasil diunggah.");
        }
      },
      onUploadError: (err) => {
        setError(`Gagal unggah banner: ${err.message}`);
      },
    });

  const { startUpload: uploadScreenshots, isUploading: isUploadingShots } =
    useUploadThing("appScreenshots", {
      onClientUploadComplete: (res) => {
        const urls = (res ?? []).map((item) => item.ufsUrl).filter(Boolean);
        if (urls.length > 0) {
          setScreenshots((prev) => [...prev, ...urls].slice(0, 12));
          setUploadMsg(`${urls.length} tangkapan layar berhasil diunggah.`);
        }
      },
      onUploadError: (err) => {
        setError(`Gagal unggah tangkapan layar: ${err.message}`);
      },
    });

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  async function handleIconSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploadMsg("Mengunggah ikon...");
    await uploadIcon(Array.from(files));
    e.target.value = "";
  }

  async function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploadMsg("Mengunggah banner...");
    await uploadBanner(Array.from(files));
    e.target.value = "";
  }

  async function handleScreenshotsSelect(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploadMsg("Mengunggah tangkapan layar...");
    await uploadScreenshots(Array.from(files));
    e.target.value = "";
  }

  function removeScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    const parsedFeatures = featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10);

    try {
      const payload = {
        name,
        slug,
        packageName,
        developerName,
        category,
        themeSkin,
        minAndroid,
        tagline,
        description,
        features: parsedFeatures,
        testerNote: testerNote.trim() || null,
        iconUrl: iconUrl || null,
        bannerUrl: bannerUrl || null,
        screenshots,
        isPublished,
        isFeatured,
      };

      const url =
        mode === "create" ? "/api/apps" : `/api/apps/${initialApp?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data aplikasi.");
        setSaving(false);
        return;
      }

      if (mode === "create") {
        router.push(`/dashboard/apps/${data.app.id}`);
        router.refresh();
      } else {
        setSuccessMsg("Perubahan aplikasi berhasil disimpan.");
        setSaving(false);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menyimpan.");
      setSaving(false);
    }
  }

  async function handleDeleteApp() {
    if (!initialApp) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/apps/${initialApp.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menghapus aplikasi.");
        setDeleting(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server.");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]"
        >
          <span className="font-semibold">Error: </span>
          {error}
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-xl border border-[#B7DFCE] bg-[#e9f4e9] px-4 py-3 text-sm text-[#006c4c] font-semibold"
        >
          {successMsg}
        </div>
      )}

      {uploadMsg && !error && (
        <div
          role="status"
          className="rounded-xl border border-[#dce3da] bg-[#f4f6f1] px-4 py-2.5 text-xs font-semibold text-[#18221c]"
        >
          {uploadMsg}
        </div>
      )}

      <section className="rounded-[18px] border border-[#dce3da] bg-white p-5 sm:p-6 space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#18221c]">
            Tampilan Kartu &amp; Aset Visual (UploadThing)
          </h2>
          <p className="text-xs text-[#52625a] mt-0.5">
            Pilih tema warna kartu, unggah ikon, banner sampul 2:1, atau pilih ilustrasi studio bawaan.
          </p>
        </div>

        <div>
          <span className="block text-sm font-semibold text-[#18221c] mb-2">
            Tema Warna Kartu &amp; Sorotan
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {APP_THEME_SKINS.map((skin) => {
              const selected = themeSkin === skin.value;
              return (
                <button
                  key={skin.value}
                  type="button"
                  onClick={() => setThemeSkin(skin.value)}
                  aria-pressed={selected}
                  className={`min-h-11 px-3 py-2 rounded-xl border flex items-center gap-2.5 text-xs font-bold text-left transition-colors ${
                    selected
                      ? "border-[#006c4c] bg-[#e9f4e9] text-[#006c4c]"
                      : "border-[#dce3da] bg-[#fafbf8] text-[#18221c] hover:border-[#bfcdbc]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: skin.coverBg }}
                  />
                  <span>{skin.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-[#dce3da] bg-[#fafbf8]">
          <AppIcon
            name={name || "App"}
            iconUrl={iconUrl || null}
            skin={themeSkin}
            size="lg"
          />
          <div className="space-y-2">
            <label
              htmlFor="app-icon-upload"
              className="block text-sm font-semibold text-[#18221c]"
            >
              Ikon Aplikasi (512x512, maks 4MB)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="app-icon-upload"
                className="min-h-10 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#bfcdbc] bg-white text-xs sm:text-sm font-bold text-[#18221c] hover:border-[#006c4c] hover:text-[#006c4c] tactile-press"
              >
                {isUploadingIcon ? "Mengunggah..." : "Pilih & Unggah Ikon"}
              </label>
              <input
                id="app-icon-upload"
                type="file"
                accept="image/*"
                disabled={isUploadingIcon}
                onChange={handleIconSelect}
                className="sr-only"
              />
              {iconUrl && (
                <button
                  type="button"
                  onClick={() => setIconUrl("")}
                  className="min-h-10 px-3 rounded-[10px] text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                >
                  Hapus Ikon
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[#dce3da] bg-[#fafbf8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label
                htmlFor="app-banner-upload"
                className="block text-sm font-semibold text-[#18221c]"
              >
                Banner Sampul Kartu &amp; Sorotan (16:9 / 2:1, maks 8MB)
              </label>
              <p className="text-xs text-[#52625a]">
                Unggah gambar sendiri via UploadThing atau gunakan preset ilustrasi studio di bawah.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="app-banner-upload"
                className="min-h-10 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#bfcdbc] bg-white text-xs sm:text-sm font-bold text-[#18221c] hover:border-[#006c4c] hover:text-[#006c4c] tactile-press"
              >
                {isUploadingBanner ? "Mengunggah..." : "Unggah Banner"}
              </label>
              <input
                id="app-banner-upload"
                type="file"
                accept="image/*"
                disabled={isUploadingBanner}
                onChange={handleBannerSelect}
                className="sr-only"
              />
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl("")}
                  className="min-h-10 px-3 rounded-[10px] text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {ARTWORK_PRESETS.map((preset) => {
              const active = bannerUrl === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setBannerUrl(preset.url);
                    setThemeSkin(preset.skin);
                  }}
                  className={`min-h-9 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#006c4c] text-white border-[#006c4c]"
                      : "bg-white text-[#52625a] border-[#dce3da] hover:border-[#006c4c] hover:text-[#18221c]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {bannerUrl ? (
            <div className="aspect-[2.17] max-h-56 w-full rounded-xl overflow-hidden border border-[#dce3da] bg-white">
              <img
                src={bannerUrl}
                alt="Pratinjau banner aplikasi"
                width={960}
                height={442}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-[#52625a] rounded-xl border border-dashed border-[#bfcdbc] bg-white p-4">
              Belum ada banner khusus. Katalog akan memakai ilustrasi default sesuai tema warna yang dipilih.
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-[#dce3da] bg-[#fafbf8] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label
                htmlFor="app-screenshots-upload"
                className="block text-sm font-semibold text-[#18221c]"
              >
                Tangkapan Layar (maks 8 gambar per unggah, maks 8MB/file)
              </label>
              <p className="text-xs text-[#52625a]">
                Ditampilkan sebagai galeri geser pada halaman detail aplikasi.
              </p>
            </div>
            <label
              htmlFor="app-screenshots-upload"
              className="min-h-10 px-4 inline-flex items-center justify-center rounded-[10px] border border-[#bfcdbc] bg-white text-xs sm:text-sm font-bold text-[#18221c] hover:border-[#006c4c] hover:text-[#006c4c] tactile-press"
            >
              {isUploadingShots ? "Mengunggah..." : "Unggah Screenshot"}
            </label>
            <input
              id="app-screenshots-upload"
              type="file"
              accept="image/*"
              multiple
              disabled={isUploadingShots}
              onChange={handleScreenshotsSelect}
              className="sr-only"
            />
          </div>

          {screenshots.length === 0 ? (
            <p className="text-xs text-[#52625a] rounded-xl border border-dashed border-[#bfcdbc] bg-white p-4">
              Belum ada tangkapan layar yang diunggah.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {screenshots.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative rounded-xl border border-[#dce3da] bg-white overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${idx + 1}`}
                    width={180}
                    height={320}
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(idx)}
                    aria-label={`Hapus tangkapan layar ${idx + 1}`}
                    className="w-full min-h-10 bg-white border-t border-[#dce3da] text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[18px] border border-[#dce3da] bg-white p-5 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#18221c]">
          Identitas &amp; Detail Aplikasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="app-name"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Nama Aplikasi
            </label>
            <input
              id="app-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Martabak Depok 78 POS"
              className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-slug"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Slug URL (/apps/...)
            </label>
            <input
              id="app-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder="martabak-depok-78-pos"
              className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm font-mono text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-package"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Android Package Name
            </label>
            <input
              id="app-package"
              type="text"
              required
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="studio.hammad.martabak78pos"
              className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm font-mono text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-developer"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Developer / Klien
            </label>
            <input
              id="app-developer"
              type="text"
              required
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Hammad Studio"
              className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-category"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Kategori
            </label>
            <select
              id="app-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#bfcdbc] bg-white text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            >
              {APP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="app-min-android"
              className="block text-sm font-semibold text-[#18221c] mb-1.5"
            >
              Minimum OS Android
            </label>
            <input
              id="app-min-android"
              type="text"
              required
              value={minAndroid}
              onChange={(e) => setMinAndroid(e.target.value)}
              placeholder="Android 8.0+"
              className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="app-tagline"
            className="block text-sm font-semibold text-[#18221c] mb-1.5"
          >
            Ringkasan Singkat (Tagline)
          </label>
          <input
            id="app-tagline"
            type="text"
            required
            maxLength={140}
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ringkasan satu kalimat fungsi utama aplikasi"
            className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="app-description"
            className="block text-sm font-semibold text-[#18221c] mb-1.5"
          >
            Deskripsi Lengkap
          </label>
          <textarea
            id="app-description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kegunaan aplikasi dan konteks versi prarilis."
            className="w-full p-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="app-features"
            className="block text-sm font-semibold text-[#18221c] mb-1.5"
          >
            Poin Fitur Aplikasi (satu fitur per baris)
          </label>
          <textarea
            id="app-features"
            rows={3}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"Aktivasi perangkat dan login PIN kasir\nKatalog produk sesuai outlet\nCetak struk thermal Bluetooth"}
            className="w-full p-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="app-tester-note"
            className="block text-sm font-semibold text-[#18221c] mb-1.5"
          >
            Catatan Penguji (opsional)
          </label>
          <input
            id="app-tester-note"
            type="text"
            maxLength={500}
            value={testerNote}
            onChange={(e) => setTesterNote(e.target.value)}
            placeholder="Contoh: Siapkan PIN kasir dari pengelola outlet sebelum masuk."
            className="w-full h-11 px-3.5 rounded-xl border border-[#bfcdbc] text-sm text-[#18221c] focus:border-[#006c4c] focus:outline-none"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4">
          <label
            htmlFor="app-published"
            className="flex items-center gap-2.5 min-h-11 text-sm font-medium text-[#18221c]"
          >
            <input
              id="app-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#006c4c]"
            />
            <span>Publikasikan di katalog publik</span>
          </label>

          <label
            htmlFor="app-featured"
            className="flex items-center gap-2.5 min-h-11 text-sm font-medium text-[#18221c]"
          >
            <input
              id="app-featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#006c4c]"
            />
            <span>Tampilkan di sorotan utama beranda</span>
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={
            saving || isUploadingIcon || isUploadingBanner || isUploadingShots
          }
          className="min-h-12 px-6 rounded-[10px] bg-[#006c4c] text-white text-sm font-bold hover:bg-[#07543c] disabled:opacity-60 tactile-press"
        >
          {saving
            ? "Menyimpan..."
            : mode === "create"
            ? "Simpan & Lanjut Tambah APK"
            : "Simpan Perubahan Aplikasi"}
        </button>

        {mode === "edit" && initialApp && (
          <div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-h-11 px-4 rounded-[10px] border border-[#FCA5A5] text-sm font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
              >
                Hapus Aplikasi
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteApp}
                  disabled={deleting}
                  className="min-h-11 px-4 rounded-[10px] bg-[#991B1B] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-11 px-3 rounded-[10px] border border-[#bfcdbc] text-sm font-medium text-[#18221c]"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
