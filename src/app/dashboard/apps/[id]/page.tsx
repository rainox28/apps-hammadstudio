import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { getAppByIdForAdmin } from "@/db/queries";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AppForm } from "@/components/AppForm";
import { ReleaseManager } from "@/components/ReleaseManager";

export const dynamic = "force-dynamic";

interface EditAppPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAppPage({ params }: EditAppPageProps) {
  const user = await requireAdminPage();
  const { id } = await params;
  const appId = Number(id);

  if (!Number.isInteger(appId) || appId <= 0) {
    notFound();
  }

  const app = await getAppByIdForAdmin(appId);
  if (!app) {
    notFound();
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F5F7F6]">
      <DashboardHeader userEmail={user.email} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center min-h-11 text-sm font-semibold text-[#017A56] hover:underline"
          >
            Kembali ke Daftar Aplikasi
          </Link>
          {app.isPublished && (
            <Link
              href={`/apps/${app.slug}`}
              className="min-h-11 px-4 inline-flex items-center rounded-xl border border-[#C8D3CC] bg-white text-sm font-semibold text-[#141917] hover:border-[#017A56] hover:text-[#017A56]"
            >
              Lihat Halaman Store
            </Link>
          )}
        </div>

        <h1 className="text-2xl font-bold text-[#141917] mt-1 tracking-tight">
          Kelola: {app.name}
        </h1>
        <p className="text-xs font-mono text-[#49544E] mt-1 mb-6">
          {app.packageName}
        </p>

        <div className="space-y-8">
          <ReleaseManager appId={app.id} releases={app.releases} />
          <AppForm mode="edit" initialApp={app} />
        </div>
      </main>
    </div>
  );
}
