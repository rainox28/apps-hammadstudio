import React, { Suspense } from "react";
import { getPublishedApps } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { StudioCatalog } from "@/components/StudioCatalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [session, appsList] = await Promise.all([
    getSession(),
    getPublishedApps(),
  ]);

  return (
    <>
      <Suspense fallback={<div className="h-[72px] border-b border-line bg-white" />}>
        <StoreHeader isAuthenticated={Boolean(session)} />
      </Suspense>

      <Suspense fallback={<div className="site-wrap py-12 text-sm text-ink-2">Memuat katalog aplikasi...</div>}>
        <StudioCatalog apps={appsList} />
      </Suspense>

      <StoreFooter />

      <Suspense fallback={null}>
        <MobileBottomNav isAuthenticated={Boolean(session)} />
      </Suspense>
    </>
  );
}
