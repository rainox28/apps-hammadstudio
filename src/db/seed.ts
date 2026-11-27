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

const JAM_WISATA_DATA = {
  slug: "jam-wisata",
  name: "Jam Wisata - Umroh & Ibadah",
  packageName: "id.jamwisata.app",
  developerName: "Jaris Ammar Madani",
  tagline: "Pilih paket umroh, daftar, bayar, dan ibadah dalam satu aplikasi.",
  description:
    "Jam Wisata adalah aplikasi resmi dari Jaris Ammar Madani, biro perjalanan umroh yang mendampingi jamaah dari pendaftaran sampai kembali ke tanah air. Setiap Waktu Bernilai Ibadah.\n\nLewat satu aplikasi, Anda bisa memilih paket umroh, mendaftar, mengurus dokumen, memantau pembayaran, sekaligus menjaga ibadah harian selama persiapan maupun saat di tanah suci.\n\nPAKET UMROH LENGKAP\nTelusuri seluruh paket yang tersedia beserta tanggal keberangkatan, harga, fasilitas, hotel, maskapai, dan sisa kuota. Setiap paket dilengkapi rincian lengkap agar Anda bisa membandingkan dengan tenang sebelum memutuskan.\n\nPENDAFTARAN ONLINE\nDaftar langsung dari ponsel tanpa harus bolak-balik ke kantor. Isi data jamaah, unggah dokumen seperti paspor dan KTP, lalu pantau status pendaftaran Anda secara berkala.\n\nPEMBAYARAN YANG TRANSPARAN\nPilih metode pembayaran, lihat rincian biaya, dan pantau status serta riwayat pembayaran Anda kapan saja.\n\nDOKUMEN DAN ITINERARY\nSimpan dokumen perjalanan di satu tempat dan lihat rencana perjalanan harian, sehingga Anda tahu agenda setiap hari selama di tanah suci.\n\nPANDUAN IBADAH HARIAN\n- Jadwal sholat yang menyesuaikan lokasi Anda\n- Al-Qur'an 30 juz dengan mushaf standar QPC Uthmani Hafs yang nyaman dibaca\n- Doa dan dzikir harian, termasuk Al-Ma'tsurat pagi dan petang secara lengkap dan berurutan\n- Asmaul Husna, 99 nama Allah beserta artinya\n\nLIVE MUTHOWIF\nIkuti siaran langsung bersama muthowif atau pembimbing ibadah, sehingga Anda tetap mendapat bimbingan meski sedang tidak berada di satu tempat.\n\nNOTIFIKASI PENTING\nTerima pemberitahuan seputar jadwal keberangkatan, status pendaftaran, dan informasi lain dari Jam Wisata.\n\nTENTANG JAM WISATA\nJaris Ammar Madani (Jam Wisata) melayani keberangkatan umroh dengan pendampingan menyeluruh, mulai dari manasik, perlengkapan, keberangkatan, hingga kepulangan jamaah.\n\nWebsite: https://jamwisata.id\nEmail: info@jamwisata.id",
  category: "Travel & Ibadah",
  themeSkin: "sky",
  bannerUrl: "/artwork/wisata.webp",
  features: [
    "Paket umroh lengkap beserta jadwal, harga, hotel, maskapai, dan kuota",
    "Pendaftaran online, unggah paspor/KTP, itinerary, dan riwayat pembayaran",
    "Al-Qur'an 30 juz QPC Uthmani Hafs, jadwal sholat, Al-Ma'tsurat, dan Asmaul Husna",
    "Live muthowif dan fitur ibadah tersedia tanpa perlu login",
  ],
  testerNote:
    "Anda dapat menjelajahi paket umroh dan menggunakan fitur ibadah (Al-Qur'an, jadwal sholat, doa dan dzikir) tanpa mendaftar terlebih dahulu. Akun hanya diperlukan untuk mendaftar paket dan mengelola dokumen.",
  minAndroid: "Android 7.0+",
  isPublished: true,
  isFeatured: true,
};

const JAM_WISATA_RELEASE = {
  versionName: "1.0.0",
  versionCode: 1,
  track: "production",
  apkUrl: "https://www.jamwisata.id/api/mobile/download/android",
  fileSizeLabel: "APK Android",
  sha256: null,
  releaseNotes:
    "Versi pertama Jam Wisata.\n\n- Jelajahi dan daftar paket umroh langsung dari aplikasi\n- Unggah dokumen jamaah dan pantau status pendaftaran\n- Pilih metode pembayaran dan lihat riwayatnya\n- Jadwal sholat sesuai lokasi\n- Al-Qur'an 30 juz mushaf QPC Uthmani Hafs\n- Doa dan dzikir harian, termasuk Al-Ma'tsurat pagi dan petang\n- Asmaul Husna beserta artinya\n- Live muthowif\n- Sebagian fitur bisa dipakai tanpa perlu login",
  publishedAt: new Date("2026-11-27T10:00:00+07:00"),
  isLatest: true,
};

async function upsertAppWithRelease(
  slugMatcher: string[],
  appData: typeof MARTABOY_DATA,
  releaseData: {
    versionName: string;
    versionCode: number;
    track: string;
    apkUrl: string;
    fileSizeLabel: string;
    sha256: string | null;
    releaseNotes: string;
    publishedAt: Date;
    isLatest: boolean;
  }
) {
  const existingApps = await db
    .select()
    .from(apps)
    .where(or(...slugMatcher.map((s) => eq(apps.slug, s))))
    .limit(1);

  let appId: number;

  if (existingApps.length === 0) {
    const [inserted] = await db
      .insert(apps)
      .values({
        ...appData,
        iconUrl: null,
        screenshots: [],
        downloadCount: 0,
      })
      .returning();
    appId = inserted.id;
    console.log(`Seeded ${appData.name}`);
  } else {
    const current = existingApps[0];
    await db
      .update(apps)
      .set({
        ...appData,
        iconUrl: current.iconUrl,
        screenshots: current.screenshots,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, current.id));
    appId = current.id;
    console.log(`Updated ${appData.name} metadata in database.`);
  }

  const existingReleases = await db
    .select()
    .from(appReleases)
    .where(
      and(
        eq(appReleases.appId, appId),
        eq(appReleases.versionName, releaseData.versionName)
      )
    )
    .limit(1);

  if (existingReleases.length === 0) {
    await db.insert(appReleases).values({
      appId,
      ...releaseData,
      downloadCount: 0,
    });
    console.log(`Seeded ${appData.name} release v${releaseData.versionName}`);
  } else {
    await db
      .update(appReleases)
      .set(releaseData)
      .where(eq(appReleases.id, existingReleases[0].id));
    console.log(`Updated ${appData.name} release v${releaseData.versionName} metadata.`);
  }
}

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

  await upsertAppWithRelease(
    ["martaboy-pos", "martabak-depok-78-pos"],
    MARTABOY_DATA,
    MARTABOY_RELEASE
  );

  await upsertAppWithRelease(
    ["jam-wisata"],
    JAM_WISATA_DATA,
    JAM_WISATA_RELEASE
  );
}

seed()
  .then(() => {
    console.log("Seed complete.");
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  });
