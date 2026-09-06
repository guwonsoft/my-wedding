import { isAdmin } from "@/lib/admin";
import { wedding } from "@/config/wedding";

/** 응답 전체를 CSV로 — 엑셀에서 바로 열리도록 UTF-8 BOM을 붙입니다. */
export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  let rows: string[][] = [];

  if (webhookUrl && webhookUrl.startsWith("http")) {
    try {
      const res = await fetch(webhookUrl, { cache: "no-store", redirect: "follow" });
      if (res.ok) {
        const data = (await res.json()) as {
          rows?: Array<{
            created_at: string;
            side: string;
            name: string;
            phone: string;
            attending: boolean;
            party_size: number;
            meal: string;
          }>;
        };
        rows = (data.rows ?? []).map((r) => [
          r.created_at,
          r.side,
          r.name,
          r.phone || "",
          r.attending ? "참석" : "불참",
          String(r.party_size || 0),
          r.attending ? r.meal : "—",
        ]);
      }
    } catch (err) {
      console.error("[admin-rsvps] Failed to fetch from Google Sheet:", err);
    }
  }

  const header = ["접수일시", "구분", "성함", "연락처", "참석여부", "참석인원", "식사여부"];

  // 엑셀 수식 삽입 취약점 방지
  const escapeCell = (cell: string) => {
    const v = String(cell);
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const csv = [header, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `rsvp-${stamp}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        `${wedding.groom.name}-${wedding.bride.name}-${filename}`,
      )}`,
      "Cache-Control": "no-store",
    },
  });
}
