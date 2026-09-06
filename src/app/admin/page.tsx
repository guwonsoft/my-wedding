import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { wedding } from "@/config/wedding";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminLogout } from "@/components/AdminLogout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "참석 여부 집계 (구글 스프레드시트)",
  robots: { index: false, follow: false },
};

type Row = {
  created_at: string;
  side: string;
  name: string;
  phone: string;
  attending: boolean;
  party_size: number;
  meal: string;
};

type SheetResponse = {
  ok: boolean;
  stats?: {
    total: number;
    attendingCount: number;
    attendingHeads: number;
    mealYes: number;
    mealNo: number;
    mealUndecided: number;
    declined: number;
    groom: number;
    bride: number;
  };
  rows?: Row[];
  error?: string;
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={Boolean(process.env.ADMIN_PASSWORD)} />;
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    return (
      <Shell>
        <div className="border border-line bg-paper-2 p-6 text-[13.5px] leading-relaxed text-ink-2">
          <h2 className="font-bold text-ink text-[16px] mb-3">📋 구글 스프레드시트 연동 대기 중</h2>
          <p className="mb-4">
            현재 <code className="font-mono text-accent-2">GOOGLE_SHEET_WEBHOOK_URL</code> 환경변수가 설정되지 않았습니다.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[13px] text-ink-2 mb-5">
            <li>구글 드라이브에서 새 스프레드시트를 생성합니다.</li>
            <li>상단 메뉴 [확장 프로그램] → [Apps Script] 를 클릭합니다.</li>
            <li>프로젝트 루트의 <code className="font-mono text-accent">google-sheets-script.js</code> 내용을 붙여넣고 [배포] → [새 배포] (유형: 웹 앱, 액세스: 모든 사용자)를 진행합니다.</li>
            <li>발급된 웹 앱 URL을 <code className="font-mono text-accent-2">.env.local</code>의 <code className="font-mono">GOOGLE_SHEET_WEBHOOK_URL</code>에 넣어주세요.</li>
          </ol>
          <p className="text-[12px] text-ink-3">
            ※ 연동이 완료되면 청첩장에서 하객이 제출하는 즉시 구글 시트에 실시간으로 기록됩니다.
          </p>
        </div>
      </Shell>
    );
  }

  let sheetData: SheetResponse = { ok: false };
  try {
    const res = await fetch(webhookUrl, {
      cache: "no-store",
      redirect: "follow",
    });
    if (res.ok) {
      sheetData = (await res.json()) as SheetResponse;
    }
  } catch (err) {
    console.error("[admin] Google Sheet fetch error:", err);
  }

  const rows = sheetData.rows ?? [];
  const stats = sheetData.stats ?? {
    total: rows.length,
    attendingCount: rows.filter((r) => r.attending).length,
    attendingHeads: rows.filter((r) => r.attending).reduce((acc, r) => acc + (r.party_size || 0), 0),
    mealYes: rows.filter((r) => r.attending && r.meal === "식사 예정").reduce((acc, r) => acc + (r.party_size || 0), 0),
    mealUndecided: rows.filter((r) => r.attending && r.meal === "미정").reduce((acc, r) => acc + (r.party_size || 0), 0),
    mealNo: rows.filter((r) => r.attending && r.meal === "식사 안함").reduce((acc, r) => acc + (r.party_size || 0), 0),
    declined: rows.filter((r) => !r.attending).length,
    groom: rows.filter((r) => r.attending && r.side === "신랑측").reduce((acc, r) => acc + (r.party_size || 0), 0),
    bride: rows.filter((r) => r.attending && r.side === "신부측").reduce((acc, r) => acc + (r.party_size || 0), 0),
  };

  return (
    <Shell>
      {/* 상단 액션 바 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-paper-2 p-4 border border-line">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
          <span className="text-[13px] font-medium text-ink">구글 스프레드시트 연동 활성화</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://sheets.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            📊 구글 시트 열기 ↗
          </a>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="총 응답" value={stats.total} unit="건" />
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
        입니다. 예식장 뷔페 예약 인원과 대조해 보세요.
      </p>

      {/* 표 */}
      <div className="mt-8 overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-paper-2">
              {["접수일시", "구분", "성함", "연락처", "참석", "인원", "식사"].map((h) => (
                <th
                  key={h}
                  className="px-3.5 py-2.5 font-mono text-[10.5px] font-normal tracking-[0.14em] text-ink-3 uppercase whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-16 text-center text-[13px] text-ink-3">
                  아직 응답이 없거나 시트에서 데이터를 불러오는 중입니다.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx} className="border-b border-line/60 last:border-0">
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-ink-3 tnum whitespace-nowrap">
                    {r.created_at}
                  </td>
                  <td className="px-3.5 py-2.5 text-[12.5px] whitespace-nowrap">{r.side}</td>
                  <td className="px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-ink-2 tnum whitespace-nowrap">
                    {r.phone ? (
                      <a href={`tel:${r.phone.replace(/-/g, "")}`} className="hover:text-accent">
                        {r.phone}
                      </a>
                    ) : (
                      <span className="text-ink-3">—</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <Badge tone={r.attending ? "on" : "off"}>{r.attending ? "참석" : "불참"}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[12.5px] tnum">{r.party_size || "—"}</td>
                  <td className="px-3.5 py-2.5 text-[12.5px] whitespace-nowrap">
                    {r.attending ? r.meal : "—"}
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
