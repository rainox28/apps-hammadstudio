# apps-hammadstudio

Platform distribusi aplikasi Android prarilis (`apps.hammad.studio`) untuk klien dan penguji sebelum publikasi resmi ke Google Play Store.

## Fitur Utama

- **Katalog Storefront Bergaya Play Store**: Pencarian aplikasi, filter kategori, sorotan aplikasi utama, halaman detail lengkap, galeri tangkapan layar, riwayat rilis, QR code unduhan langsung untuk perangkat Android, serta pelacakan jumlah unduhan nyata di database.
- **Dashboard Pengelola (`/dashboard`)**: Dilindungi autentikasi email & kata sandi dengan sesi tersimpan di PostgreSQL (`sessions`). Mengelola daftar aplikasi, unggah ikon & tangkapan layar via UploadThing, serta manajemen versi rilis `.apk` (baik melalui URL eksternal maupun unggah langsung ke UploadThing).
- **Panduan Pasang APK (`/panduan`)**: Petunjuk pemasangan file `.apk` di Android bagi penguji.

## Stack

- Next.js App Router (TypeScript + Tailwind CSS)
- Neon PostgreSQL + Drizzle ORM
- UploadThing (`appIcon`, `appScreenshots`, `apkRelease`)
- Custom Auth (bcryptjs + jose JWT + HTTP-only cookie + tabel `sessions`)

## Menjalankan Secara Lokal

1. Salin `.env.example` menjadi `.env.local` dan lengkapi variabel `DATABASE_URL`, `UPLOADTHING_TOKEN`, `AUTH_SECRET`, serta kredensial admin awal.
2. Pasang dependency:
   ```bash
   npm install
   ```
3. Dorong skema Drizzle ke Neon PostgreSQL dan jalankan seed awal (akun admin + contoh Martabak Depok 78 POS v0.7.0):
   ```bash
   npm run db:push
   npm run db:seed
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
