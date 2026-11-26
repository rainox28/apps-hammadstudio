import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

export const apps = pgTable(
  "apps",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    packageName: text("package_name").notNull(),
    developerName: text("developer_name").notNull().default("Hammad Studio"),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("Bisnis & Kasir"),
    themeSkin: text("theme_skin").notNull().default("emerald"),
    iconUrl: text("icon_url"),
    bannerUrl: text("banner_url"),
    screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    testerNote: text("tester_note"),
    minAndroid: text("min_android").notNull().default("Android 8.0+"),
    isPublished: boolean("is_published").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    downloadCount: integer("download_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("apps_published_idx").on(table.isPublished),
    index("apps_category_idx").on(table.category),
  ]
);

export const appReleases = pgTable(
  "app_releases",
  {
    id: serial("id").primaryKey(),
    appId: integer("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    versionName: text("version_name").notNull(),
    versionCode: integer("version_code").notNull().default(1),
    track: text("track").notNull().default("beta"),
    apkUrl: text("apk_url").notNull(),
    fileSizeLabel: text("file_size_label").notNull(),
    sha256: text("sha256"),
    releaseNotes: text("release_notes").notNull(),
    downloadCount: integer("download_count").notNull().default(0),
    isLatest: boolean("is_latest").notNull().default(true),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
  },
  (table) => [
    index("app_releases_app_id_idx").on(table.appId),
    index("app_releases_latest_idx").on(table.isLatest),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const appsRelations = relations(apps, ({ many }) => ({
  releases: many(appReleases),
}));

export const appReleasesRelations = relations(appReleases, ({ one }) => ({
  app: one(apps, {
    fields: [appReleases.appId],
    references: [apps.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type AppRecord = typeof apps.$inferSelect;
export type AppRelease = typeof appReleases.$inferSelect;
