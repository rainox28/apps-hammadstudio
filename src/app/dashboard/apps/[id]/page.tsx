import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { getAppByIdForAdmin } from "@/db/queries";
import { DashboardShell } from "@/components/DashboardShell";
import { getAppReleaseStage } from "@/lib/constants";
import { getStageLabel, getTileSrc } from "@/lib/app-art";
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

  const stage = getAppReleaseStage(app.releases[0] ?? null);

  return (
    <DashboardShell userEmail={user.email}>
      <main className="px-4 py-7 sm:px-8 lg:px-10 lg:py-8 max-w-[1080px]">
        <Link
          href="/dashboard"
          className="inline-flex items-center min-h-10 text-[13px] font-semibold text-ink-3 hover:text-ink"
        >
          ← Semua aplikasi
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <img
            src={getTileSrc(app)}
            alt=""
            width={72}
            height={72}
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-[18px] object-cover shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
          />
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-[1.6rem] sm:text-[1.75rem] font-extrabold tracking-[-0.02em]">{app.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-1 font-semibold text-ink-2">
                <span aria-hidden="true" className="status-dot" data-stage={stage} />
                {getStageLabel(stage)}
              </span>
              <span className="font-mono text-xs">{app.packageName}</span>
              {!app.isPublished && <span>· Draf</span>}
            </p>
          </div>
          {app.isPublished && (
            <Link
              href={`/apps/${app.slug}`}
              className="min-h-11 px-5 inline-flex items-center rounded-full border border-line-strong bg-white text-sm font-semibold text-accent hover:border-accent"
            >
              Lihat di store
            </Link>
          )}
        </div>

        <nav aria-label="Bagian halaman" className="mt-6 mb-6 flex gap-6 border-b border-line">
          <a href="#rilis" className="border-b-[3px] border-accent pb-3 text-sm font-bold text-accent">Rilis</a>
          <a href="#info-aplikasi" className="border-b-[3px] border-transparent pb-3 text-sm font-medium text-ink-3 hover:text-ink">Info &amp; visual</a>
        </nav>

        <div className="space-y-8">
          <div id="rilis" className="scroll-mt-6">
            <ReleaseManager appId={app.id} releases={app.releases} />
          </div>
          <div id="info-aplikasi" className="scroll-mt-6">
            <AppForm mode="edit" initialApp={app} />
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
