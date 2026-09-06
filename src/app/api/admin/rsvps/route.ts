import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { wedding } from "@/config/wedding";

/** 응답 전체를 CSV로 — 엑셀에서 바로 열리도록 UTF-8 BOM을 붙입니다. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return new Response("Database not configured", { status: 503 });

  const { data, error } = await supabase
    .from("rsvps")
    .select("created_at, side, name, phone, attending, party_size, meal, message")
    .order("created_at", { ascending: false });

  if (error) return new Response("Query failed", { status: 500 });

  const header = ["응답일시", "구분", "성함", "연락처", "참석여부", "인원", "식사", "메시지"];
  const rows = (data ?? []).map((r) => [
    new Date(r.created_at as string).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    r.side === "bride" ? "신부측" : "신랑측",
    r.name as string,
    (r.phone as string | null) ?? "",
    r.attending ? "참석" : "불참",
    String(r.party_size ?? 0),
    r.meal === "yes" ? "예정" : r.meal === "no" ? "안함" : "미정",
    ((r.message as string | null) ?? "").replace(/\r?\n/g, " "),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `rsvp-${stamp}.csv`;

  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        `${wedding.groom.name}-${wedding.bride.name}-${filename}`,
      )}`,
      "Cache-Control": "no-store",
    },
  });
}
