import React from "react";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AppForm } from "@/components/AppForm";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  const user = await requireAdminPage();

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7F6]">
      <DashboardHeader userEmail={user.email} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center min-h-11 text-sm font-semibold text-[#017A56] hover:underline"
        >
          Kembali ke Daftar Aplikasi
        </Link>

        <h1 className="text-2xl font-bold text-[#141917] mt-1 tracking-tight">
          Tambah Aplikasi Baru
        </h1>
        <p className="text-sm text-[#49544E] mt-1 mb-6">
          Isi identitas aplikasi dan unggah ikon/tangkapan layar, lalu tambahkan rilis APK di langkah berikutnya.
        </p>

        <AppForm mode="create" />
      </main>
    </div>
  );
}
