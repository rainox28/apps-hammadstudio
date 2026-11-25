import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apps } from "@/db/schema";
import { getPublishedApps, getAllAppsForAdmin } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { appInputSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");

  if (scope === "admin") {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const items = await getAllAppsForAdmin();
    return NextResponse.json({ apps: items });
  }

  const q = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const items = await getPublishedApps({ q, category });
  return NextResponse.json({ apps: items });
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const existingSlug = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.slug, data.slug))
      .limit(1);

    if (existingSlug.length > 0) {
      return NextResponse.json(
        { error: "Slug sudah dipakai aplikasi lain. Gunakan slug berbeda." },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(apps)
      .values({
        name: data.name,
        slug: data.slug,
        packageName: data.packageName,
        developerName: data.developerName,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        iconUrl: data.iconUrl || null,
        screenshots: data.screenshots,
        minAndroid: data.minAndroid,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      })
      .returning();

    return NextResponse.json({ app: created }, { status: 201 });
  } catch (error) {
    console.error("Create app error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan aplikasi." },
      { status: 500 }
    );
  }
}
