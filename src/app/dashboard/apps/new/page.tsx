import React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { AppForm } from "@/components/AppForm";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  const user = await requireAdminPage();

  return (
    <DashboardShell userEmail={user.email}>
      <main className="px-4 py-7 sm:px-8 lg:px-10 lg:py-8 max-w-[1080px]">
        <Link
          href="/dashboard"
          className="inline-flex items-center min-h-10 text-[13px] font-semibold text-ink-3 hover:text-ink"
        >
          ← Semua aplikasi
        </Link>
        <h1 className="mt-2 text-[1.75rem] font-extrabold tracking-[-0.02em]">Tambah aplikasi</h1>
        <p className="mt-1 mb-7 text-sm text-ink-3">
          Isi identitas dan visual aplikasi, lalu tambahkan rilis APK di langkah berikutnya.
        </p>
        <AppForm mode="create" />
      </main>
    </DashboardShell>
  );
}
