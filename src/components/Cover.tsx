import { wedding } from "@/config/wedding";
import { kst } from "@/lib/date";
import { Photo } from "./Photo";
import { Petals } from "./Petals";

export function Cover() {
  const cover = wedding.gallery[wedding.coverIndex];
  const t = kst(wedding.date);
  const p = (n: number) => String(n).padStart(2, "0");
  const meridiem = t.hour < 12 ? "AM" : "PM";
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const weekdayEn = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][t.weekday];

  return (
    <section className="relative isolate flex h-[100dvh] min-h-[600px] flex-col overflow-hidden">
      {/* 배경 사진 — 천천히 밀려 들어옵니다 */}
      <div className="kenburns absolute inset-0 motion-reduce:animate-none">
        <Photo
          src={cover.src}
          alt={`${wedding.groom.name}, ${wedding.bride.name}`}
          index={wedding.coverIndex + 1}
          fill
          preload
          sizes="(max-width: 460px) 100vw, 460px"
          className="object-cover"
        />
      </div>

      {/* 위는 살짝 어둡게(글자 가독), 아래는 종이색으로 녹아들게 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(35,32,28,0.38) 0%, rgba(35,32,28,0.10) 22%, rgba(246,243,238,0) 42%, rgba(246,243,238,0.80) 72%, #f6f3ee 94%)",
        }}
        aria-hidden
      />

      <Petals />

      <div className="relative flex h-full flex-col justify-between px-7 pt-14 pb-10">
        {/* ── 머리 ── */}
        <div className="text-center" data-reveal="blur">
          <p className="font-mono text-[10px] tracking-[0.44em] text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
            THE WEDDING OF
          </p>
        </div>

        {/* ── 이름 · 일시 ── */}
        <div className="text-center">
          <p
            className="font-mono text-[11px] tracking-[0.34em] text-ink-2 tnum"
            data-reveal
            style={{ ["--reveal-delay" as string]: "150ms" }}
          >
            {t.year} . {p(t.month)} . {p(t.day)} &nbsp;{weekdayEn}
          </p>

          <h1
            // 이름 길이에 따라 폭이 크게 달라지므로 화면 폭에 맞춰 유동적으로.
            // 캔버스가 460px에서 멈추므로 위쪽 한계(42px)에 먼저 걸립니다.
            className="mt-5 font-[family-name:var(--font-cormorant)] text-[clamp(28px,8.6vw,42px)] font-light leading-[1.05] tracking-[0.01em] text-ink"
            data-reveal="scale"
            style={{ ["--reveal-delay" as string]: "260ms" }}
          >
            {wedding.groom.en}
            <span className="mx-[0.16em] align-[0.08em] text-[0.68em] text-accent">&</span>
            {wedding.bride.en}
          </h1>

          <div
            className="mx-auto mt-6 h-px w-12 bg-line"
            data-reveal
            style={{ ["--reveal-delay" as string]: "380ms" }}
          />

          <p
            className="mt-6 font-[family-name:var(--font-ko-serif)] text-[16px] tracking-[0.22em] text-ink"
            data-reveal
            style={{ ["--reveal-delay" as string]: "440ms" }}
          >
            {wedding.groom.name}
            <span className="mx-2 text-ink-3">·</span>
            {wedding.bride.name}
          </p>

          <p
            className="mt-3 font-mono text-[10.5px] tracking-[0.16em] text-ink-2"
            data-reveal
            style={{ ["--reveal-delay" as string]: "520ms" }}
          >
            {meridiem} {h12}:{p(t.minute)} · {wedding.venue.name} {wedding.venue.hall}
          </p>

          {/* 스크롤 유도 */}
          <div className="mt-10 flex justify-center" aria-hidden>
            <span className="scroll-cue block h-9 w-px bg-gradient-to-b from-transparent to-ink-3 motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
