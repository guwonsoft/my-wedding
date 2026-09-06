import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { getSupabase } from "@/lib/supabase";
import { wedding } from "@/config/wedding";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminLogout } from "@/components/AdminLogout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "참석 여부 집계",
  robots: { index: false, follow: false },
};

type Row = {
  id: string;
  created_at: string;
  side: "groom" | "bride";
  name: string;
  phone: string | null;
  attending: boolean;
  party_size: number;
  meal: "yes" | "no" | "undecided";
  message: string | null;
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={Boolean(process.env.ADMIN_PASSWORD)} />;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return (
      <Shell>
        <p className="border border-line bg-paper-2 p-5 text-[13px] leading-relaxed text-ink-2">
          Supabase 환경변수(<code className="font-mono text-accent-2">SUPABASE_URL</code>,{" "}
          <code className="font-mono text-accent-2">SUPABASE_SERVICE_ROLE_KEY</code>)가 설정되어 있지
          않습니다.
        </p>
      </Shell>
    );
  }

  const { data, error } = await supabase
    .from("rsvps")
    .select("id, created_at, side, name, phone, attending, party_size, meal, message")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Shell>
        <p className="border border-line bg-paper-2 p-5 text-[13px] text-ink-2">
          응답을 불러오지 못했습니다: {error.message}
        </p>
      </Shell>
    );
  }

  const rows = (data ?? []) as Row[];
  const going = rows.filter((r) => r.attending);

  const sum = (list: Row[]) => list.reduce((acc, r) => acc + (r.party_size || 0), 0);
  const stats = {
    responses: rows.length,
    attendingHeads: sum(going),
    declined: rows.length - going.length,
    mealYes: sum(going.filter((r) => r.meal === "yes")),
    mealUndecided: sum(going.filter((r) => r.meal === "undecided")),
    mealNo: sum(going.filter((r) => r.meal === "no")),
    groom: sum(going.filter((r) => r.side === "groom")),
    bride: sum(going.filter((r) => r.side === "bride")),
  };

  return (
    <Shell>
      {/* 요약 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="응답" value={stats.responses} unit="건" />
        <Stat label="참석 인원" value={stats.attendingHeads} unit="명" accent />
        <Stat label="식사 예정" value={stats.mealYes} unit="명" accent />
        <Stat label="불참" value={stats.declined} unit="건" />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="신랑측" value={stats.groom} unit="명" small />
        <Stat label="신부측" value={stats.bride} unit="명" small />
        <Stat label="식사 미정" value={stats.mealUndecided} unit="명" small />
        <Stat label="식사 안함" value={stats.mealNo} unit="명" small />
      </div>

      <p className="mt-4 border-l-2 border-accent bg-paper-2 px-4 py-3 text-[12.5px] leading-relaxed text-ink-2">
        뷔페 예상 인원은 <b className="text-ink">식사 예정 {stats.mealYes}명</b>
        {stats.mealUndecided > 0 && (
          <>
            {" "}
            (+ 미정 {stats.mealUndecided}명 → 최대{" "}
            <b className="text-ink">{stats.mealYes + stats.mealUndecided}명</b>)
          </>
        )}
        입니다. 예식장 계약 인원과 비교해 보세요.
      </p>

      {/* 표 */}
      <div className="mt-8 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              {["응답일시", "구분", "성함", "연락처", "참석", "인원", "식사", "메시지"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 font-mono text-[10px] font-normal tracking-[0.14em] text-ink-3 uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-16 text-center text-[13px] text-ink-3">
                  아직 응답이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0">
                  <td className="px-3 py-2.5 font-mono text-[11px] text-ink-3 tnum whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("ko-KR", {
                      timeZone: "Asia/Seoul",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2.5 text-[12.5px] whitespace-nowrap">
                    {r.side === "bride" ? "신부측" : "신랑측"}
                  </td>
                  <td className="px-3 py-2.5 text-[13px] font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-ink-2 tnum whitespace-nowrap">
                    {r.phone ? (
                      <a href={`tel:${r.phone.replace(/-/g, "")}`} className="hover:text-accent">
                        {r.phone}
                      </a>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Badge tone={r.attending ? "on" : "off"}>{r.attending ? "참석" : "불참"}</Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12.5px] tnum">{r.party_size || "—"}</td>
                  <td className="px-3 py-2.5 text-[12.5px] whitespace-nowrap">
                    {r.attending
                      ? r.meal === "yes"
                        ? "예정"
                        : r.meal === "no"
                          ? "안함"
                          : "미정"
                      : "—"}
                  </td>
                  <td className="max-w-[280px] px-3 py-2.5 text-[12.5px] text-ink-2">
                    {r.message || <span className="text-ink-3">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <a
          href="/api/admin/rsvps"
          className="inline-flex items-center gap-2 border border-line px-4 py-2.5 font-mono text-[10.5px] tracking-[0.16em] text-ink-2 uppercase transition-colors hover:border-accent hover:text-accent"
        >
          CSV 내려받기
        </a>
        <span className="font-mono text-[10px] text-ink-3">엑셀에서 바로 열립니다</span>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1000px]">
        <header className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-ink-3 uppercase">
              RSVP Dashboard
            </p>
            <h1 className="mt-1.5 font-[family-name:var(--font-ko-serif)] text-[21px] tracking-[0.06em]">
              {wedding.groom.name} · {wedding.bride.name}
            </h1>
          </div>
          <AdminLogout />
        </header>
        {children}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
  small,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`border border-line bg-paper px-4 ${small ? "py-3" : "py-4"}`}>
      <p className="font-mono text-[10px] tracking-[0.16em] text-ink-3 uppercase">{label}</p>
      <p className="mt-1.5">
        <span
          className={`font-[family-name:var(--font-cormorant)] font-light tnum ${
            small ? "text-[22px]" : "text-[30px]"
          } ${accent ? "text-accent-2" : "text-ink"}`}
        >
          {value}
        </span>
        <span className="ml-1 text-[11px] text-ink-3">{unit}</span>
      </p>
    </div>
  );
}

function Badge({ tone, children }: { tone: "on" | "off"; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] tracking-[0.1em] ${
        tone === "on" ? "border-accent text-accent-2" : "border-line text-ink-3"
      }`}
    >
      {children}
    </span>
  );
}
