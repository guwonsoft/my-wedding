import type { NextRequest } from "next/server";
import { getSupabase, NOT_CONFIGURED } from "@/lib/supabase";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { wedding } from "@/config/wedding";

type Payload = {
  attending?: unknown;
  side?: unknown;
  name?: unknown;
  phone?: unknown;
  partySize?: unknown;
  meal?: unknown;
  message?: unknown;
  agree?: unknown;
  website?: unknown;
};

const MEALS = ["yes", "no", "undecided"] as const;

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`rsvp:${clientIp(req)}`)) {
    return bad("잠시 후 다시 시도해 주세요.", 429);
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return bad("요청 형식이 올바르지 않습니다.");
  }

  // 허니팟에 뭔가 채워졌다면 봇 — 성공한 척하고 조용히 버립니다.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const deadline = new Date(wedding.rsvp.deadline || wedding.date).getTime();
  if (Number.isFinite(deadline) && deadline < Date.now()) {
    return bad("응답 기간이 종료되었습니다.", 410);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 20) return bad("성함을 확인해 주세요.");
  if (body.agree !== true) return bad("개인정보 수집·이용 동의가 필요합니다.");

  const side = body.side === "bride" ? "bride" : "groom";
  const attending = body.attending !== false;
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const phone = phoneRaw.slice(0, 20) || null;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 200) : "";
  const meal = MEALS.includes(body.meal as (typeof MEALS)[number])
    ? (body.meal as (typeof MEALS)[number])
    : "undecided";

  const rawSize = Number(body.partySize);
  const partySize = attending
    ? Math.min(10, Math.max(1, Number.isFinite(rawSize) ? Math.floor(rawSize) : 1))
    : 0;

  const supabase = getSupabase();
  if (!supabase) return Response.json(NOT_CONFIGURED, { status: 503 });

  const { error } = await supabase.from("rsvps").insert({
    name,
    phone,
    side,
    attending,
    party_size: partySize,
    meal: attending ? meal : "no",
    message: message || null,
  });

  if (error) {
    console.error("[rsvp] insert failed:", error.message);
    return bad("저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.", 500);
  }

  return Response.json({ ok: true });
}
