import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "emotionary_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sign(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET.");
  }

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAuthConfigStatus() {
  return {
    hasPassword: Boolean(getPassword()),
    hasSessionSecret: Boolean(getSessionSecret()),
  };
}

export function verifyAdminPassword(candidate: string) {
  const expected = getPassword();

  if (!expected) {
    throw new Error("Missing ADMIN_PASSWORD.");
  }

  return safeEqual(candidate, expected);
}

export async function createAdminSession() {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, `${issuedAt}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!value) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");
  const timestamp = Number(issuedAt);

  if (!issuedAt || !signature || Number.isNaN(timestamp)) {
    return false;
  }

  const ageSeconds = (Date.now() - timestamp) / 1000;

  if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  try {
    return safeEqual(signature, sign(issuedAt));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }
}

export async function assertAdminSession() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Session expired. Sign in again.");
  }
}
