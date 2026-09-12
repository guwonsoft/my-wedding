import { wedding, type Account } from "@/config/wedding";
import { Section, SectionLabel } from "./ui";
import { CopyButton } from "./CopyButton";

/**
 * 마음 전하실 곳.
 *
 * 예전에는 신랑측/신부측을 눌러 펼치는 아코디언이었는데, 어르신 하객이
 * "눌러서 여는" 흐름에 익숙하지 않아 계좌를 전부 펼쳐서 보여드립니다.
 */
export function Accounts() {
  const groups = [
    { key: "groom", title: "신랑측", en: "GROOM", list: wedding.accounts.groom },
    { key: "bride", title: "신부측", en: "BRIDE", list: wedding.accounts.bride },
  ] as const;

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

      <div className="mt-8 space-y-3">
        {groups.map((g, i) => (
          <div
            key={g.key}
            className="border border-line bg-paper"
            data-reveal
            style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
          >
            <div className="flex items-center gap-3 border-b border-line/70 px-5 py-3.5">
              <span className="font-mono text-[10px] tracking-[0.22em] text-accent">{g.en}</span>
              <span className="font-[family-name:var(--font-ko-serif)] text-[14.5px] tracking-[0.08em] text-ink">
                {g.title}
              </span>
            </div>

            <ul className="divide-y divide-line/70">
              {g.list.map((a) => (
                <AccountRow key={`${a.label}-${a.number}`} account={a} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AccountRow({ account }: { account: Account }) {
  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-ink-3">
            {account.label}
            <span className="mx-1.5">·</span>
            <span className="font-[family-name:var(--font-ko-serif)] text-[14.5px] text-ink">
              {account.holder}
            </span>
          </p>
          {/* 계좌번호는 가장 크게 — 눈으로 읽고 손으로 옮겨적는 분들이 계십니다 */}
          <p className="mt-1.5 text-[12px] text-ink-3">{account.bank}</p>
          <p className="mt-0.5 font-mono text-[15px] leading-snug tracking-[0.02em] text-ink tnum">
            {account.number}
          </p>
        </div>
        <CopyButton
          size="lg"
          value={`${account.bank} ${account.number} ${account.holder}`}
        />
      </div>

      {account.kakaopay && (
        <a
          href={account.kakaopay}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 flex items-center justify-center gap-1.5 bg-[#FEE500] py-3 text-[13px] font-medium text-[#3C1E1E] transition-opacity active:opacity-80"
        >
          카카오페이로 송금
        </a>
      )}
    </li>
  );
}
