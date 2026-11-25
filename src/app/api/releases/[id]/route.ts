import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appReleases, apps } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const releaseId = Number(id);
  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    return NextResponse.json({ error: "ID rilis tidak valid." }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(appReleases)
    .where(eq(appReleases.id, releaseId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Rilis tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json();
  if (body?.isLatest === true) {
    await db
      .update(appReleases)
      .set({ isLatest: false })
      .where(eq(appReleases.appId, existing.appId));

    const [updated] = await db
      .update(appReleases)
      .set({ isLatest: true })
      .where(eq(appReleases.id, releaseId))
      .returning();

    await db
      .update(apps)
      .set({ updatedAt: new Date() })
      .where(eq(apps.id, existing.appId));

    return NextResponse.json({ release: updated });
  }

  return NextResponse.json({ error: "Aksi pembaruan tidak didukung." }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const releaseId = Number(id);
  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    return NextResponse.json({ error: "ID rilis tidak valid." }, { status: 400 });
  }

  const deleted = await db
    .delete(appReleases)
    .where(eq(appReleases.id, releaseId))
    .returning({ id: appReleases.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Rilis tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
