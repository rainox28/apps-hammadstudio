import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { getAppByIdForAdmin } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { appInputSchema } from "@/lib/validators";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId <= 0) {
    return NextResponse.json({ error: "ID aplikasi tidak valid." }, { status: 400 });
  }

  const app = await getAppByIdForAdmin(appId);
  if (!app) {
    return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ app });
}

export async function PATCH(
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

    const body = await req.json();
    const parsed = appInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Data aplikasi tidak valid." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const duplicate = await db
      .select({ id: apps.id })
      .from(apps)
      .where(and(eq(apps.slug, data.slug), ne(apps.id, appId)))
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: "Slug sudah dipakai aplikasi lain." },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(apps)
      .set({
        name: data.name,
        slug: data.slug,
        packageName: data.packageName,
        developerName: data.developerName,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        iconUrl: data.iconUrl || null,
        bannerUrl: data.bannerUrl || null,
        screenshots: data.screenshots,
        minAndroid: data.minAndroid,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, appId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ app: updated });
  } catch (error) {
    console.error("Update app error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui aplikasi." },
      { status: 500 }
    );
  }
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
  const appId = Number(id);
  if (!Number.isInteger(appId) || appId <= 0) {
    return NextResponse.json({ error: "ID aplikasi tidak valid." }, { status: 400 });
  }

  const deleted = await db.delete(apps).where(eq(apps.id, appId)).returning({ id: apps.id });
  if (deleted.length === 0) {
    return NextResponse.json({ error: "Aplikasi tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
