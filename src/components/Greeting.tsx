import { wedding } from "@/config/wedding";
import { Section, SectionLabel, VerticalRule } from "./ui";
import { Contacts } from "./Contacts";
import { NoticeButton } from "./NoticeModal";

export function Greeting() {
  const { groom, bride, greeting } = wedding;

  return (
    <Section id="invitation" className="pt-16">
      <div className="flex flex-col items-center text-center">
        <SectionLabel index={1} en="Invitation" ko={greeting.title} />

        <p
          className="mt-9 font-[family-name:var(--font-ko-serif)] text-[15px] leading-[2.2] tracking-[0.02em] whitespace-pre-line text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          {greeting.body}
        </p>

        <VerticalRule height={44} />

        {/* 혼주 · 신랑신부 */}
        <div className="space-y-3" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
          {[
            { p: groom, side: "신랑" },
            { p: bride, side: "신부" },
          ].map(({ p, side }) => (
            <p
              key={side}
              className="font-[family-name:var(--font-ko-serif)] text-[14.5px] tracking-[0.04em] text-ink"
            >
              <span className="text-ink-2">
                {p.father.late && <span className="mr-0.5 text-ink-3">故</span>}
                {p.father.name}
                <span className="mx-1.5 text-ink-3">·</span>
                {p.mother.late && <span className="mr-0.5 text-ink-3">故</span>}
                {p.mother.name}
              </span>
              <span className="mx-2 text-[12px] text-ink-3">의 {p.rank}</span>
              <span className="text-[16px]">{p.given}</span>
            </p>
          ))}
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3" data-reveal style={{ ["--reveal-delay" as string]: "200ms" }}>
          <NoticeButton />
        </div>

        {/* 연락처는 접어두지 않고 그대로 펼쳐 보여드립니다 */}
        <Contacts />
      </div>
    </Section>
  );
}

