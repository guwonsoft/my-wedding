import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * 방명록 삭제용 4자리 비밀번호 해시.
 * 금융 수준의 비밀은 아니지만, 평문 저장은 하지 않습니다.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(8).toString("hex");
  return `${salt}:${sha(password, salt)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const a = Buffer.from(sha(password, salt), "hex");
  const b = Buffer.from(digest, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function sha(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}::${password}`).digest("hex");
}
