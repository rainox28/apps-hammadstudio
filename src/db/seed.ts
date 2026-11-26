import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { appReleases, apps, users } from "./schema";

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
    .select()
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
        tagline: "Buka katalog outlet, catat transaksi, dan cetak struk dari perangkat kasir.",
        description:
          "Aplikasi kasir Android untuk operasional outlet Martabak Depok 78. Kasir dapat memilih menu dan topping dari katalog outlet, mencetak struk thermal Bluetooth, memantau stok adonan harian, dan menyinkronkan laporan transaksi.",
        category: "Bisnis & Kasir",
        themeSkin: "amber",
        iconUrl: null,
        bannerUrl: "/artwork/martaboy.webp",
        screenshots: [],
        features: [
          "Aktivasi perangkat outlet dan login cepat dengan PIN kasir",
          "Katalog produk dan variasi topping sesuai cabang",
          "Cetak struk thermal Bluetooth dan simpan bukti pembayaran",
        ],
        testerNote:
          "Untuk masuk setelah instalasi, siapkan aktivasi perangkat dan PIN kasir dari pengelola outlet.",
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
    const current = existingApp[0];
    if (!current.bannerUrl || (current.features?.length ?? 0) === 0) {
      await db
        .update(apps)
        .set({
          themeSkin: current.themeSkin === "emerald" ? "amber" : current.themeSkin,
          bannerUrl: current.bannerUrl || "/artwork/martaboy.webp",
          features:
            (current.features?.length ?? 0) > 0
              ? current.features
              : [
                  "Aktivasi perangkat outlet dan login cepat dengan PIN kasir",
                  "Katalog produk dan variasi topping sesuai cabang",
                  "Cetak struk thermal Bluetooth dan simpan bukti pembayaran",
                ],
          testerNote:
            current.testerNote ||
            "Untuk masuk setelah instalasi, siapkan aktivasi perangkat dan PIN kasir dari pengelola outlet.",
        })
        .where(eq(apps.id, current.id));
      console.log("Updated Martabak Depok 78 POS with Studio Apps artwork & features.");
    } else {
      console.log("Martabak Depok 78 POS already seeded.");
    }
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
