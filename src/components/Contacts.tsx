import { wedding, type Person } from "@/config/wedding";

type Row = { role: string; name: string; phone: string; late?: boolean };

function rowsFor(person: Person, side: "신랑" | "신부"): Row[] {
  return [
    { role: side, name: person.name, phone: person.phone },
    { role: "아버지", name: person.father.name, phone: person.father.phone, late: person.father.late },
    { role: "어머니", name: person.mother.name, phone: person.mother.phone, late: person.mother.late },
  ];
}

/**
 * 혼주·신랑신부 연락처.
 *
 * 예전에는 버튼을 눌러 바텀시트를 여는 방식이었는데, 어르신 하객이
 * "눌러서 들어가는" 흐름에 익숙하지 않아 그냥 펼쳐둡니다.
 * 전화번호를 글자로도 보여드려서 눈으로 확인하거나 받아적을 수 있게 했습니다.
 */
export function Contacts() {
  const groups = [
    { en: "GROOM", ko: "신랑측", rows: rowsFor(wedding.groom, "신랑") },
    { en: "BRIDE", ko: "신부측", rows: rowsFor(wedding.bride, "신부") },
  ];

  return (
    <div className="mt-10 w-full space-y-3">
      {groups.map((g, gi) => (
        <div
          key={g.en}
          className="border border-line bg-paper"
          data-reveal
          style={{ ["--reveal-delay" as string]: `${gi * 90}ms` }}
        >
          <div className="flex items-center gap-3 border-b border-line/70 px-5 py-3.5">
            <span className="font-mono text-[10px] tracking-[0.22em] text-accent">{g.en}</span>
            <span className="font-[family-name:var(--font-ko-serif)] text-[14.5px] tracking-[0.08em] text-ink">
              {g.ko}
            </span>
          </div>

          <ul className="divide-y divide-line/70">
            {g.rows
              .filter((r) => !r.late)
              .map((r) => (
                <li key={`${g.en}-${r.role}`} className="px-5 py-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-ink-3">
                        {r.role}
                        <span className="mx-1.5">·</span>
                        <span className="font-[family-name:var(--font-ko-serif)] text-[14.5px] text-ink">
                          {r.name}
                        </span>
                      </p>
                      {/* 번호를 글자로 노출 — 전화 앱을 못 쓰셔도 보고 누르실 수 있게 */}
                      <p className="mt-1.5 font-mono text-[14px] tracking-[0.04em] text-ink-2 tnum">
                        {r.phone}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <a
                        href={`tel:${r.phone.replace(/-/g, "")}`}
                        aria-label={`${r.name}에게 전화 걸기`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-2 transition-colors active:bg-paper-2"
                      >
                        <PhoneIcon />
                      </a>
                      <a
                        href={`sms:${r.phone.replace(/-/g, "")}`}
                        aria-label={`${r.name}에게 문자 보내기`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-2 transition-colors active:bg-paper-2"
                      >
                        <MailIcon />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5.2 2.2 6.6 5 5.3 6.4c.7 1.5 1.8 2.6 3.3 3.3L10 8.4l2.8 1.4-.5 2.4c-.1.5-.6.9-1.1.8C6.6 12.4 3.6 9.4 2.6 4.8c-.1-.5.3-1 .8-1.1l1.8-.4Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.8" y="3.5" width="12.4" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="m2.4 4.6 5.6 4 5.6-4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
