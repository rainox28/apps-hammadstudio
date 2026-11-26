import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { appReleases, apps } from "@/db/schema";
import { getSession } from "@/lib/auth";

async function recordDownload(releaseId: number) {
  const rows = await db
    .select({
      releaseId: appReleases.id,
      apkUrl: appReleases.apkUrl,
      appId: apps.id,
      isPublished: apps.isPublished,
    })
    .from(appReleases)
    .innerJoin(apps, eq(appReleases.appId, apps.id))
    .where(eq(appReleases.id, releaseId))
    .limit(1);

  const row = rows[0];
  if (!row) return { status: 404 as const, error: "File rilis tidak ditemukan." };

  if (!row.isPublished) {
    const admin = await getSession();
    if (!admin) return { status: 403 as const, error: "Rilis belum dipublikasikan." };
  }

  await db.batch([
    db
      .update(appReleases)
      .set({ downloadCount: sql`${appReleases.downloadCount} + 1` })
      .where(eq(appReleases.id, row.releaseId)),
    db
      .update(apps)
      .set({ downloadCount: sql`${apps.downloadCount} + 1` })
      .where(eq(apps.id, row.appId)),
  ]);

  return { status: 200 as const, apkUrl: row.apkUrl };
}

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const releaseId = Number(id);
  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    return NextResponse.json({ error: "ID rilis tidak valid." }, { status: 400 });
  }

  const result = await recordDownload(releaseId);
  if (result.status !== 200) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const releaseId = Number(id);
  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    return NextResponse.json({ error: "ID rilis tidak valid." }, { status: 400 });
  }

  const result = await recordDownload(releaseId);
  if (result.status !== 200) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.redirect(result.apkUrl, 302);
}
