import type { ReactNode } from "react";

/**
 * 섹션 머리 라벨.
 *   01 ──── INVITATION
 *           초대합니다
 * 모노스페이스 + 자간으로 "설계도" 느낌의 얇은 레이어를 만듭니다.
 */
export function SectionLabel({
  index,
  en,
  ko,
  align = "center",
}: {
  index: number;
  en: string;
  ko?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      data-reveal
      className={`flex flex-col gap-3 ${align === "center" ? "items-center" : "items-start"}`}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-accent tnum">
          {String(index).padStart(2, "0")}
        </span>
        <span className="h-px w-6 bg-line" />
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink-3">{en}</span>
      </div>
      {ko && (
        <h2 className="font-[family-name:var(--font-ko-serif)] text-[19px] tracking-[0.12em] text-ink">
          {ko}
        </h2>
      )}
    </div>
  );
}

/** 공통 섹션 컨테이너 — 좌우 여백과 세로 리듬을 한 곳에서 관리 */
export function Section({
  id,
  children,
  className = "",
  tone = "paper",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "deep";
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-4 px-7 py-20 ${tone === "deep" ? "bg-paper-2" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

/** 세로 얇은 선 — 섹션 사이 호흡 */
export function VerticalRule({ height = 56 }: { height?: number }) {
  return (
    <div className="flex justify-center" data-reveal>
      <span className="vline block" style={{ height }} />
    </div>
  );
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`hairline ${className}`} />;
}
