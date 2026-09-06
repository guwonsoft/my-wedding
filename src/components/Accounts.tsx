"use client";

import { useState } from "react";
import { wedding, type Account } from "@/config/wedding";
import { Section, SectionLabel } from "./ui";
import { CopyButton } from "./CopyButton";

export function Accounts() {
  const groups = [
    { key: "groom", title: "신랑측", en: "GROOM", list: wedding.accounts.groom },
    { key: "bride", title: "신부측", en: "BRIDE", list: wedding.accounts.bride },
  ] as const;

  const [open, setOpen] = useState<string | null>(null);

  return (
    <Section id="accounts">
      <div className="flex flex-col items-center text-center">
        <SectionLabel index={6} en="With Heart" ko="마음 전하실 곳" />
        <p
          className="mt-7 text-[13px] leading-[2] text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "100ms" }}
        >
          참석이 어려우신 분들을 위해
          <br />
          계좌번호를 남겨 두었습니다.
          <br />
          <span className="text-ink-3">축하해 주시는 마음, 감사히 간직하겠습니다.</span>
        </p>
      </div>

      <div className="mt-8 space-y-2">
        {groups.map((g, i) => {
          const isOpen = open === g.key;
          return (
            <div
              key={g.key}
              className="border border-line bg-paper"
              data-reveal
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : g.key)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <span className="font-mono text-[10px] tracking-[0.22em] text-accent">{g.en}</span>
                <span className="flex-1 font-[family-name:var(--font-ko-serif)] text-[14.5px] tracking-[0.08em] text-ink">
                  {g.title}
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                  className={`text-ink-3 transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m2.5 4.5 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>

              <div
                className={`grid transition-all duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="divide-y divide-line/70 border-t border-line/70">
                    {g.list.map((a) => (
                      <AccountRow key={`${a.label}-${a.number}`} account={a} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function AccountRow({ account }: { account: Account }) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-ink-3">
            {account.label}
            <span className="mx-1.5">·</span>
            {account.holder}
          </p>
          <p className="mt-1 font-mono text-[12.5px] tracking-[0.04em] text-ink tnum">
            {account.bank} {account.number}
          </p>
        </div>
        <CopyButton value={`${account.bank} ${account.number} ${account.holder}`} />
      </div>

      {account.kakaopay && (
        <a
          href={account.kakaopay}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 flex items-center justify-center gap-1.5 bg-[#FEE500] py-2.5 text-[12px] font-medium text-[#3C1E1E] transition-opacity active:opacity-80"
        >
          카카오페이로 송금
        </a>
      )}
    </li>
  );
}
