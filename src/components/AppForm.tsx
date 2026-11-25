"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_CATEGORIES, slugify } from "@/lib/constants";
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
  const [minAndroid, setMinAndroid] = useState(
    initialApp?.minAndroid ?? "Android 8.0+"
  );
  const [tagline, setTagline] = useState(initialApp?.tagline ?? "");
  const [description, setDescription] = useState(initialApp?.description ?? "");
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
          setUploadMsg("Banner feature graphic 16:9 berhasil diunggah.");
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
    setUploadMsg("Mengunggah banner feature graphic...");
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

    try {
      const payload = {
        name,
        slug,
        packageName,
        developerName,
        category,
        minAndroid,
        tagline,
        description,
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
          className="rounded-xl border border-[#B7DFCE] bg-[#E6F4EE] px-4 py-3 text-sm text-[#017A56] font-medium"
        >
          {successMsg}
        </div>
      )}

      {uploadMsg && !error && (
        <div
          role="status"
          className="rounded-xl border border-[#E2E8E5] bg-[#F8FAF9] px-4 py-2.5 text-xs font-medium text-[#111815]"
        >
          {uploadMsg}
        </div>
      )}

      <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5 sm:p-6 space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#111815]">
            Aset Play Store (UploadThing)
          </h2>
          <p className="text-xs text-[#48544E] mt-0.5">
            Unggah ikon aplikasi 1:1, banner feature graphic 16:9, dan tangkapan layar UI aplikasi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9]">
          <AppIcon name={name || "App"} iconUrl={iconUrl || null} size="lg" />
          <div className="space-y-2">
            <label
              htmlFor="app-icon-upload"
              className="block text-sm font-semibold text-[#111815]"
            >
              Ikon Aplikasi (512x512, maks 4MB)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="app-icon-upload"
                className="min-h-10 px-4 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-xs sm:text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
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
                  className="min-h-10 px-3 rounded-full text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                >
                  Hapus Ikon
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label
                htmlFor="app-banner-upload"
                className="block text-sm font-semibold text-[#111815]"
              >
                Banner Feature Graphic (16:9 atau 1024x500, maks 8MB)
              </label>
              <p className="text-xs text-[#48544E]">
                Ditampilkan sebagai banner promosi utama pada katalog dan halaman detail aplikasi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="app-banner-upload"
                className="min-h-10 px-4 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-xs sm:text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
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
                  className="min-h-10 px-3 rounded-full text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                >
                  Hapus Banner
                </button>
              )}
            </div>
          </div>

          {bannerUrl ? (
            <div className="aspect-[21/9] max-h-56 w-full rounded-xl overflow-hidden border border-[#E2E8E5] bg-white">
              <img
                src={bannerUrl}
                alt="Pratinjau banner aplikasi"
                width={960}
                height={410}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <p className="text-xs text-[#48544E] rounded-xl border border-dashed border-[#C8D3CC] bg-white p-4">
              Belum ada banner feature graphic. Jika dikosongkan, halaman sorotan menggunakan panel studio gelap.
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-[#E2E8E5] bg-[#F8FAF9] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label
                htmlFor="app-screenshots-upload"
                className="block text-sm font-semibold text-[#111815]"
              >
                Tangkapan Layar (maks 8 gambar per unggah, maks 8MB/file)
              </label>
              <p className="text-xs text-[#48544E]">
                Ditampilkan sebagai galeri geser seperti halaman detail Google Play.
              </p>
            </div>
            <label
              htmlFor="app-screenshots-upload"
              className="min-h-10 px-4 inline-flex items-center justify-center rounded-full border border-[#C8D3CC] bg-white text-xs sm:text-sm font-semibold text-[#111815] hover:border-[#017A56] hover:text-[#017A56] tactile-press"
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
            <p className="text-xs text-[#48544E] rounded-xl border border-dashed border-[#C8D3CC] bg-white p-4">
              Belum ada tangkapan layar yang diunggah.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {screenshots.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative rounded-xl border border-[#E2E8E5] bg-white overflow-hidden"
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
                    className="w-full min-h-10 bg-white border-t border-[#E2E8E5] text-xs font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E2E8E5] bg-white p-5 sm:p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#111815]">
          Identitas &amp; Detail Aplikasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="app-name"
              className="block text-sm font-semibold text-[#111815] mb-1.5"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-slug"
              className="block text-sm font-semibold text-[#111815] mb-1.5"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm font-mono text-[#111815] focus:border-[#017A56] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-package"
              className="block text-sm font-semibold text-[#111815] mb-1.5"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm font-mono text-[#111815] focus:border-[#017A56] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-developer"
              className="block text-sm font-semibold text-[#111815] mb-1.5"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="app-category"
              className="block text-sm font-semibold text-[#111815] mb-1.5"
            >
              Kategori
            </label>
            <select
              id="app-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[#C8D3CC] bg-white text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
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
              className="block text-sm font-semibold text-[#111815] mb-1.5"
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
              className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="app-tagline"
            className="block text-sm font-semibold text-[#111815] mb-1.5"
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
            className="w-full h-11 px-3.5 rounded-xl border border-[#C8D3CC] text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="app-description"
            className="block text-sm font-semibold text-[#111815] mb-1.5"
          >
            Deskripsi Lengkap
          </label>
          <textarea
            id="app-description"
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan fitur utama, catatan penguji, dan cakupan versi prarilis."
            className="w-full p-3.5 rounded-xl border border-[#C8D3CC] text-sm text-[#111815] focus:border-[#017A56] focus:outline-none"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-4">
          <label
            htmlFor="app-published"
            className="flex items-center gap-2.5 min-h-11 text-sm font-medium text-[#111815]"
          >
            <input
              id="app-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#017A56]"
            />
            <span>Publikasikan di katalog publik</span>
          </label>

          <label
            htmlFor="app-featured"
            className="flex items-center gap-2.5 min-h-11 text-sm font-medium text-[#111815]"
          >
            <input
              id="app-featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#017A56]"
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
          className="min-h-12 px-6 rounded-full bg-[#017A56] text-white text-sm font-semibold hover:bg-[#016346] disabled:opacity-60 tactile-press"
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
                className="min-h-11 px-4 rounded-full border border-[#FCA5A5] text-sm font-semibold text-[#991B1B] hover:bg-[#FEF2F2]"
              >
                Hapus Aplikasi
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeleteApp}
                  disabled={deleting}
                  className="min-h-11 px-4 rounded-full bg-[#991B1B] text-white text-sm font-semibold disabled:opacity-60"
                >
                  {deleting ? "Menghapus..." : "Ya, Hapus Permanen"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="min-h-11 px-3 rounded-full border border-[#C8D3CC] text-sm font-medium text-[#111815]"
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
