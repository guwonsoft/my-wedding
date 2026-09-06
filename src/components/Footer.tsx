import { wedding } from "@/config/wedding";
import { formatStamp } from "@/lib/date";

export function Footer() {
  return (
    <footer className="border-t border-line px-7 pt-14 pb-[calc(88px+env(safe-area-inset-bottom))] text-center">
      <p
        className="font-[family-name:var(--font-cormorant)] text-[clamp(20px,6vw,26px)] font-light tracking-[0.02em] text-ink"
        data-reveal
      >
        {wedding.groom.en}
        <span className="mx-[0.18em] text-[0.72em] text-accent">&</span>
        {wedding.bride.en}
      </p>

      <p
        className="mt-4 font-mono text-[10px] tracking-[0.18em] text-ink-3 tnum"
        data-reveal
        style={{ ["--reveal-delay" as string]: "80ms" }}
      >
        {formatStamp(wedding.date)}
      </p>

      <p
        className="mt-6 text-[12px] leading-[2] text-ink-2"
        data-reveal
        style={{ ["--reveal-delay" as string]: "140ms" }}
      >
        소중한 걸음으로 축복해 주셔서
        <br />
        진심으로 감사드립니다.
      </p>

      <div className="mx-auto mt-9 h-px w-10 bg-line" />

      {/* 만든 사람 서명 — 지우셔도 됩니다 */}
      <p className="mt-5 font-mono text-[9px] tracking-[0.16em] text-ink-3/70 uppercase">
        Handcrafted with Next.js
        <span className="mx-1.5 text-line">·</span>
        guwonsoft.com
      </p>
    </footer>
  );
}
