"use client";

import { useState } from "react";
import { wedding, type Person } from "@/config/wedding";
import { Sheet, GhostButton } from "./Sheet";

type Row = { group: string; role: string; name: string; phone: string; late?: boolean };

function rowsFor(person: Person, side: string): Row[] {
  return [
    { group: side, role: side === "신랑측" ? "신랑" : "신부", name: person.name, phone: person.phone },
    { group: side, role: "아버지", name: person.father.name, phone: person.father.phone, late: person.father.late },
    { group: side, role: "어머니", name: person.mother.name, phone: person.mother.phone, late: person.mother.late },
  ];
}

export function ContactSheet() {
  const [open, setOpen] = useState(false);
  const groups = [
    { title: "신랑측", rows: rowsFor(wedding.groom, "신랑측") },
    { title: "신부측", rows: rowsFor(wedding.bride, "신부측") },
  ];

  return (
    <>
      <GhostButton onClick={() => setOpen(true)}>
        <PhoneIcon />
        연락하기
      </GhostButton>

      <Sheet open={open} onClose={() => setOpen(false)} title="contact">
        <div className="space-y-7 pb-2">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-3 font-mono text-[10px] tracking-[0.24em] text-accent">
                {g.title === "신랑측" ? "GROOM" : "BRIDE"}
              </p>
              <ul className="divide-y divide-line/70 border-y border-line/70">
                {g.rows
                  .filter((r) => !r.late)
                  .map((r) => (
                    <li key={`${r.group}-${r.role}`} className="flex items-center gap-3 py-3.5">
                      <span className="w-14 shrink-0 text-[12px] text-ink-3">{r.role}</span>
                      <span className="flex-1 font-[family-name:var(--font-ko-serif)] text-[15px] tracking-[0.06em]">
                        {r.name}
                      </span>
                      <a
                        href={`tel:${r.phone.replace(/-/g, "")}`}
                        aria-label={`${r.name}에게 전화`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 transition-colors active:bg-paper-2"
                      >
                        <PhoneIcon />
                      </a>
                      <a
                        href={`sms:${r.phone.replace(/-/g, "")}`}
                        aria-label={`${r.name}에게 문자`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 transition-colors active:bg-paper-2"
                      >
                        <MailIcon />
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
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
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.8" y="3.5" width="12.4" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="m2.4 4.6 5.6 4 5.6-4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
