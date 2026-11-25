import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { apps, appReleases, users } from "./schema";

async function seed() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || "admin@hammad.studio";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "HammadAdmin2026!";

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

  const slug = "martabak-depok-78-pos";
  const existingApp = await db
    .select({ id: apps.id })
    .from(apps)
    .where(eq(apps.slug, slug))
    .limit(1);

  if (existingApp.length === 0) {
    const [insertedApp] = await db
      .insert(apps)
      .values({
        slug,
        name: "Martabak Depok 78 POS",
        packageName: "studio.hammad.martabak78pos",
        developerName: "Hammad Studio",
        tagline: "Aplikasi kasir dan manajemen pesanan outlet Martabak Depok 78.",
        description:
          "Martabak Depok 78 POS membantu kasir mencatat transaksi outlet secara cepat, mencetak struk thermal Bluetooth, memantau stok adonan dan topping harian, serta menyinkronkan laporan penjualan ke server pusat.\n\nBuild prarilis ini disediakan khusus untuk perangkat tablet dan ponsel Android kasir sebelum publikasi resmi di Google Play.",
        category: "Bisnis & Kasir",
        iconUrl: null,
        screenshots: [],
        minAndroid: "Android 8.0+",
        isPublished: true,
        isFeatured: true,
        downloadCount: 0,
      })
      .returning();

    await db.insert(appReleases).values({
      appId: insertedApp.id,
      versionName: "0.7.0",
      versionCode: 7,
      track: "beta",
      apkUrl: "https://martabak.hammad.studio/storage/releases/martabak-depok-78-pos-v0.7.0.apk",
      fileSizeLabel: "APK Prarilis",
      sha256: null,
      releaseNotes:
        "- Perbaikan koneksi printer thermal Bluetooth saat cetak ulang struk.\n- Penyesuaian tampilan daftar pesanan aktif pada layar tablet.\n- Peningkatan stabilitas sinkronisasi transaksi offline.",
      downloadCount: 0,
      isLatest: true,
    });

    console.log("Seeded Martabak Depok 78 POS v0.7.0");
  } else {
    console.log("Martabak Depok 78 POS already seeded.");
  }
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
