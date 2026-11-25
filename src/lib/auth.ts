import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, gt } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE_NAME = "apps_hammad_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "dev-fallback-secret-apps-hammad-studio";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  sessionId: string;
}

export async function createUserSession(user: {
  id: number;
  name: string;
  email: string;
  role: string;
}): Promise<void> {
  const sessionId = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  });

  const token = await new SignJWT({
    sid: sessionId,
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sid = typeof payload.sid === "string" ? payload.sid : null;
    const uid = typeof payload.uid === "number" ? payload.uid : null;
    if (!sid || !uid) return null;

    const now = new Date();
    const rows = await db
      .select({
        sessionId: sessions.id,
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sid), eq(sessions.userId, uid), gt(sessions.expiresAt, now)))
      .limit(1);

    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function requireAdminPage(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      if (typeof payload.sid === "string") {
        await db.delete(sessions).where(eq(sessions.id, payload.sid));
      }
    } catch {
      // Ignore malformed token during logout.
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
