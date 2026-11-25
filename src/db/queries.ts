import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "./index";
import { appReleases, apps, type AppRecord, type AppRelease } from "./schema";

export interface AppWithLatestRelease extends AppRecord {
  latestRelease: AppRelease | null;
}

export interface AppWithAllReleases extends AppRecord {
  releases: AppRelease[];
}

export async function getPublishedApps(filters?: {
  q?: string;
  category?: string;
}): Promise<AppWithLatestRelease[]> {
  const conditions = [eq(apps.isPublished, true)];

  if (filters?.category && filters.category !== "Semua") {
    conditions.push(eq(apps.category, filters.category));
  }

  if (filters?.q && filters.q.trim().length > 0) {
    const pattern = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(apps.name, pattern),
        ilike(apps.tagline, pattern),
        ilike(apps.packageName, pattern),
        ilike(apps.developerName, pattern)
      )!
    );
  }

  const appRows = await db
    .select()
    .from(apps)
    .where(and(...conditions))
    .orderBy(desc(apps.isFeatured), desc(apps.updatedAt));

  if (appRows.length === 0) return [];

  const appIds = appRows.map((a) => a.id);
  const releaseRows = await db
    .select()
    .from(appReleases)
    .where(inArray(appReleases.appId, appIds))
    .orderBy(desc(appReleases.isLatest), desc(appReleases.versionCode), desc(appReleases.publishedAt));

  const latestByAppId = new Map<number, AppRelease>();
  for (const rel of releaseRows) {
    if (!latestByAppId.has(rel.appId)) {
      latestByAppId.set(rel.appId, rel);
    }
  }

  return appRows.map((app) => ({
    ...app,
    latestRelease: latestByAppId.get(app.id) ?? null,
  }));
}

export async function getPublishedAppBySlug(slug: string): Promise<AppWithAllReleases | null> {
  const appRows = await db
    .select()
    .from(apps)
    .where(and(eq(apps.slug, slug), eq(apps.isPublished, true)))
    .limit(1);

  const app = appRows[0];
  if (!app) return null;

  const releases = await db
    .select()
    .from(appReleases)
    .where(eq(appReleases.appId, app.id))
    .orderBy(desc(appReleases.isLatest), desc(appReleases.versionCode), desc(appReleases.publishedAt));

  return { ...app, releases };
}

export async function getAllAppsForAdmin(): Promise<
  (AppWithLatestRelease & { releaseCount: number })[]
> {
  const appRows = await db.select().from(apps).orderBy(desc(apps.updatedAt));
  if (appRows.length === 0) return [];

  const releaseRows = await db
    .select()
    .from(appReleases)
    .orderBy(desc(appReleases.isLatest), desc(appReleases.versionCode), desc(appReleases.publishedAt));

  const latestByAppId = new Map<number, AppRelease>();
  const countByAppId = new Map<number, number>();

  for (const rel of releaseRows) {
    countByAppId.set(rel.appId, (countByAppId.get(rel.appId) ?? 0) + 1);
    if (!latestByAppId.has(rel.appId)) {
      latestByAppId.set(rel.appId, rel);
    }
  }

  return appRows.map((app) => ({
    ...app,
    latestRelease: latestByAppId.get(app.id) ?? null,
    releaseCount: countByAppId.get(app.id) ?? 0,
  }));
}

export async function getAppByIdForAdmin(id: number): Promise<AppWithAllReleases | null> {
  const appRows = await db.select().from(apps).where(eq(apps.id, id)).limit(1);
  const app = appRows[0];
  if (!app) return null;

  const releases = await db
    .select()
    .from(appReleases)
    .where(eq(appReleases.appId, app.id))
    .orderBy(desc(appReleases.isLatest), desc(appReleases.versionCode), desc(appReleases.publishedAt));

  return { ...app, releases };
}

export async function getStoreStatsForAdmin() {
  const [appCounts] = await db
    .select({
      totalApps: sql<number>`count(*)::int`,
      publishedApps: sql<number>`count(*) filter (where ${apps.isPublished} = true)::int`,
      totalDownloads: sql<number>`coalesce(sum(${apps.downloadCount}), 0)::int`,
    })
    .from(apps);

  const [releaseCounts] = await db
    .select({
      totalReleases: sql<number>`count(*)::int`,
    })
    .from(appReleases);

  return {
    totalApps: appCounts?.totalApps ?? 0,
    publishedApps: appCounts?.publishedApps ?? 0,
    totalDownloads: appCounts?.totalDownloads ?? 0,
    totalReleases: releaseCounts?.totalReleases ?? 0,
  };
}
