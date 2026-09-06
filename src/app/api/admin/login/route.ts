import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, COOKIE_OPTIONS, checkPassword, issueToken } from "@/lib/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 비밀번호 대입 시도를 늦춥니다.
  if (!rateLimit(`admin-login:${clientIp(req)}`, 6, 300_000)) {
    return Response.json({ ok: false, error: "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { ok: false, error: "ADMIN_PASSWORD 환경변수가 설정되어 있지 않습니다." },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return Response.json({ ok: false, error: "비밀번호가 일치하지 않습니다." }, { status: 401 });
  }

  const token = issueToken();
  if (!token) return Response.json({ ok: false, error: "로그인 처리에 실패했습니다." }, { status: 500 });

  (await cookies()).set(ADMIN_COOKIE, token, COOKIE_OPTIONS);
  return Response.json({ ok: true });
}

/** 로그아웃 */
export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
