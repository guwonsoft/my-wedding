import type { NextRequest } from "next/server";
import { getSupabase, NOT_CONFIGURED } from "@/lib/supabase";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/hash";
import { isAdmin } from "@/lib/admin";

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

/** 삭제 — 본인 비밀번호 또는 관리자 세션 */
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!rateLimit(`guestbook-del:${clientIp(req)}`, 10)) {
    return bad("잠시 후 다시 시도해 주세요.", 429);
  }

  const { id } = await ctx.params;
  const supabase = getSupabase();
  if (!supabase) return Response.json(NOT_CONFIGURED, { status: 503 });

  const admin = await isAdmin();

  let password = "";
  if (!admin) {
    try {
      const body = (await req.json()) as { password?: unknown };
      password = typeof body.password === "string" ? body.password.trim() : "";
    } catch {
      return bad("요청 형식이 올바르지 않습니다.");
    }
    if (!password) return bad("비밀번호를 입력해 주세요.");
  }

  const { data, error } = await supabase
    .from("guestbook")
    .select("id, password_hash")
    .eq("id", id)
    .single();

  if (error || !data) return bad("이미 삭제되었거나 찾을 수 없는 글입니다.", 404);

  if (!admin && !verifyPassword(password, data.password_hash as string)) {
    return bad("비밀번호가 일치하지 않습니다.", 403);
  }

  const { error: delError } = await supabase.from("guestbook").delete().eq("id", id);
  if (delError) {
    console.error("[guestbook] delete failed:", delError.message);
    return bad("삭제 중 문제가 발생했습니다.", 500);
  }

  return Response.json({ ok: true });
}
