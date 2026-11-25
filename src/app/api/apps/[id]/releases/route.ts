import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appReleases, apps } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { releaseInputSchema } from "@/lib/validators";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const appId = Number(id);
    if (!Number.isInteger(appId) || appId <= 0) {
      return NextResponse.json({ error: "ID aplikasi tidak valid." }, { status: 400 });
    }

    const [existingApp] = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.id, appId))
      .limit(1);

    if (!existingApp) {
      return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = releaseInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data rilis tidak valid." },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.isLatest) {
      await db
        .update(appReleases)
        .set({ isLatest: false })
        .where(eq(appReleases.appId, appId));
    }

    const [createdRelease] = await db
      .insert(appReleases)
      .values({
        appId,
        versionName: data.versionName,
        versionCode: data.versionCode,
        track: data.track,
        apkUrl: data.apkUrl,
        fileSizeLabel: data.fileSizeLabel,
        sha256: data.sha256 || null,
        releaseNotes: data.releaseNotes,
        isLatest: data.isLatest,
      })
      .returning();

    await db.update(apps).set({ updatedAt: new Date() }).where(eq(apps.id, appId));

    return NextResponse.json({ release: createdRelease }, { status: 201 });
  } catch (error) {
    console.error("Create release error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan rilis APK." },
      { status: 500 }
    );
  }
}
