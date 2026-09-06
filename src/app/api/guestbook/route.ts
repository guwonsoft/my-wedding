import type { NextRequest } from "next/server";
import { getSupabase, NOT_CONFIGURED } from "@/lib/supabase";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "@/lib/hash";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

/** 목록 — 최신순, 커서(offset) 기반 */
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return Response.json({ ...NOT_CONFIGURED, entries: [], hasMore: false }, { status: 503 });

  const offset = Math.max(0, Number(req.nextUrl.searchParams.get("offset") ?? 0) || 0);

  const { data, error, count } = await supabase
    .from("guestbook")
    .select("id, name, message, created_at", { count: "exact" })
    .eq("hidden", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("[guestbook] select failed:", error.message);
    return bad("방명록을 불러오지 못했습니다.", 500);
  }

  return Response.json({
    ok: true,
    entries: (data ?? []) as GuestbookEntry[],
    total: count ?? 0,
    hasMore: (count ?? 0) > offset + PAGE_SIZE,
  });
}

/** 작성 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`guestbook:${clientIp(req)}`, 5)) {
    return bad("잠시 후 다시 시도해 주세요.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("요청 형식이 올바르지 않습니다.");
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const password = typeof body.password === "string" ? body.password.trim() : "";

  if (!name || name.length > 20) return bad("성함을 확인해 주세요.");
  if (!message) return bad("메시지를 입력해 주세요.");
  if (message.length > 300) return bad("메시지는 300자까지 입력할 수 있습니다.");
  if (!/^\d{4}$/.test(password)) return bad("삭제용 비밀번호는 숫자 4자리로 입력해 주세요.");

  const supabase = getSupabase();
  if (!supabase) return Response.json(NOT_CONFIGURED, { status: 503 });

  const { data, error } = await supabase
    .from("guestbook")
    .insert({ name, message, password_hash: hashPassword(password) })
    .select("id, name, message, created_at")
    .single();

  if (error || !data) {
    console.error("[guestbook] insert failed:", error?.message);
    return bad("저장 중 문제가 발생했습니다.", 500);
  }

  // 필요한 필드만 골라서 돌려줍니다 — password_hash가 실수로 새어 나갈 여지를 없앱니다.
  const entry: GuestbookEntry = {
    id: data.id as string,
    name: data.name as string,
    message: data.message as string,
    created_at: data.created_at as string,
  };
  return Response.json({ ok: true, entry });
}
