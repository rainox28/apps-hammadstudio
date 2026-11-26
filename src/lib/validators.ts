import { z } from "zod";

const mediaPathOrUrl = z
  .string()
  .refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "URL atau path media tidak valid."
  )
  .nullable()
  .optional()
  .or(z.literal(""));

export const loginSchema = z.object({
  email: z.string().email("Masukkan alamat email yang valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

export const appInputSchema = z.object({
  name: z.string().min(2, "Nama aplikasi minimal 2 karakter.").max(80),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  packageName: z
    .string()
    .min(3, "Package name wajib diisi.")
    .max(120)
    .regex(/^[a-zA-Z0-9_.]+$/, "Format package name tidak valid (contoh: studio.hammad.app)."),
  developerName: z.string().min(2, "Nama developer wajib diisi.").max(80),
  tagline: z.string().min(4, "Tagline minimal 4 karakter.").max(140),
  description: z.string().min(10, "Deskripsi aplikasi minimal 10 karakter.").max(5000),
  category: z.string().min(2, "Kategori wajib dipilih."),
  themeSkin: z.enum(["emerald", "amber", "sky", "plum"]).default("emerald"),
  iconUrl: mediaPathOrUrl,
  bannerUrl: mediaPathOrUrl,
  screenshots: z
    .array(
      z.string().refine(
        (val) => val.startsWith("/") || /^https?:\/\//.test(val),
        "URL tangkapan layar tidak valid."
      )
    )
    .max(12)
    .default([]),
  features: z.array(z.string().min(1).max(160)).max(10).default([]),
  testerNote: z.string().max(500).nullable().optional().or(z.literal("")),
  minAndroid: z.string().min(2).max(40).default("Android 8.0+"),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const releaseInputSchema = z.object({
  versionName: z.string().min(1, "Versi wajib diisi (contoh: 0.7.0).").max(32),
  versionCode: z.coerce.number().int().min(1, "Version code minimal 1."),
  track: z.enum(["internal", "alpha", "beta", "rc", "production"]).default("beta"),
  apkUrl: z.string().url("URL file APK harus berupa tautan valid (https://...)."),
  fileSizeLabel: z.string().min(1, "Ukuran file wajib diisi (contoh: 24.8 MB).").max(32),
  sha256: z.string().max(128).nullable().optional().or(z.literal("")),
  releaseNotes: z.string().min(2, "Catatan rilis wajib diisi.").max(4000),
  isLatest: z.boolean().default(true),
});
