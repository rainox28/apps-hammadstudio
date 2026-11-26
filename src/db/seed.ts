import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { and, eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { appReleases, apps, users } from "./schema";

const MARTABOY_DATA = {
  slug: "martaboy-pos",
  name: "MartaBoy POS",
  packageName: "com.hammadstudio.martabakdepok78.pos",
  developerName: "Hammad Studio",
  tagline:
    "Aplikasi kasir Android untuk outlet Martabak Depok 78. Catat pesanan, simpan bukti pembayaran, dan cetak struk dari HP atau tablet.",
  description:
    "MartaBoy POS membantu kru mencatat pesanan sesuai katalog outlet, memilih varian dan topping, serta menyimpan foto bukti pembayaran. Saat transaksi dikonfirmasi, penjualan tercatat di server pusat dan stok bahan serta kemasan berkurang sesuai resep yang sudah dikonfigurasi.",
  category: "Bisnis & Kasir",
  themeSkin: "amber",
  bannerUrl: "/artwork/martaboy.webp",
  features: [
    "Aktifkan perangkat untuk outlet yang sesuai, lalu masuk sehari-hari dengan PIN kasir.",
    "Catat penjualan walk-in dan pesanan dari GrabFood, GoFood, atau ShopeeFood.",
    "Lihat riwayat transaksi dan bukti pembayaran, serta cetak struk dengan printer thermal Bluetooth yang kompatibel.",
  ],
  testerNote:
    "Versi beta ini didistribusikan sebagai APK untuk kru dan pengelola outlet. Siapkan akun ERP untuk aktivasi pertama dan pastikan perangkat terhubung ke internet saat login dan mengonfirmasi pembayaran.",
  minAndroid: "Android 7.0 (API 24)",
  isPublished: true,
  isFeatured: true,
};

const MARTABOY_RELEASE = {
  versionName: "0.7.0",
  versionCode: 7,
  track: "beta",
  apkUrl:
    "https://martabak.hammad.studio/storage/releases/martabak-depok-78-pos-v0.7.0.apk",
  fileSizeLabel: "118,1 MB",
  sha256:
    "5d37d319c3156480c7fd9933af283ebec1d6d725fa6ec7d5877d518c0d70b0fa",
  releaseNotes:
    "- Perbaikan alur login dan pergantian akun kasir.\n- Perbaikan konfirmasi checkout dan unggah foto bukti QRIS.\n- Pembaruan riwayat transaksi dan tampilan pemantauan untuk admin.\n\nPembaruan dalam aplikasi:\nMartabak Mini dipesan dalam kelipatan dua. Dua Mini boleh berbeda varian dan memakai satu dus.",
  publishedAt: new Date("2026-11-25T10:00:00+07:00"),
  isLatest: true,
};

async function seed() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@hammad.studio";
  const adminPassword =
    process.env.ADMIN_DEFAULT_PASSWORD || "HammadAdmin2026!";

  const existingAdmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.insert(users).values({
      name: "Hammad Studio Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  const existingApps = await db
    .select()
    .from(apps)
    .where(
      or(
        eq(apps.slug, "martaboy-pos"),
        eq(apps.slug, "martabak-depok-78-pos")
      )
    )
    .limit(1);

  let appId: number;

  if (existingApps.length === 0) {
    const [inserted] = await db
      .insert(apps)
      .values({
        ...MARTABOY_DATA,
        iconUrl: null,
        screenshots: [],
        downloadCount: 0,
      })
      .returning();
    appId = inserted.id;
    console.log("Seeded MartaBoy POS");
  } else {
    const current = existingApps[0];
    await db
      .update(apps)
      .set({
        ...MARTABOY_DATA,
        iconUrl: current.iconUrl,
        screenshots: current.screenshots,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, current.id));
    appId = current.id;
    console.log("Updated MartaBoy POS metadata in database.");
  }

  const existingReleases = await db
    .select()
    .from(appReleases)
    .where(
      and(
        eq(appReleases.appId, appId),
        eq(appReleases.versionName, MARTABOY_RELEASE.versionName)
      )
    )
    .limit(1);

  if (existingReleases.length === 0) {
    await db.insert(appReleases).values({
      appId,
      ...MARTABOY_RELEASE,
      downloadCount: 0,
    });
    console.log("Seeded MartaBoy POS release v0.7.0");
  } else {
    await db
      .update(appReleases)
      .set(MARTABOY_RELEASE)
      .where(eq(appReleases.id, existingReleases[0].id));
    console.log("Updated MartaBoy POS release v0.7.0 metadata.");
  }
}

seed()
  .then(() => {
    console.log("Seed complete.");
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  });
