import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "wedding_admin";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7일

function secret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/** `만료시각.서명` 형태의 상태 없는 세션 토큰 */
export function issueToken(): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  return `${exp}.${sign(String(exp), key)}`;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyToken(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp, key));
}

/** 비밀번호 확인 (로그인) */
export function checkPassword(input: string): boolean {
  const key = secret();
  if (!key) return false;
  return safeEqual(input, key);
}

/** 현재 요청이 관리자 세션인지 */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SEC,
} as const;
