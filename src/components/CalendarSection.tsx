import { wedding } from "@/config/wedding";
import { countdown, formatKoreanDateTime, kst, monthGrid } from "@/lib/date";
import { Section, SectionLabel } from "./ui";
import { Countdown } from "./Countdown";
import { AddToCalendar } from "./AddToCalendar";

const DAY_HEAD = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarSection() {
  const t = kst(wedding.date);
  const cells = monthGrid(t.year, t.month);

  return (
    <Section id="calendar" tone="deep">
      <div className="flex flex-col items-center">
        <SectionLabel index={2} en="The Day" ko="예식 안내" />

        <p
          className="mt-8 font-[family-name:var(--font-ko-serif)] text-[16px] tracking-[0.04em] text-ink"
          data-reveal
          style={{ ["--reveal-delay" as string]: "100ms" }}
        >
          {formatKoreanDateTime(wedding.date)}
        </p>
        <p
          className="mt-2 text-[13px] text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "160ms" }}
        >
          {wedding.venue.name} {wedding.venue.hall}
        </p>

        {/* ── 달력 ── */}
        <div
          className="mt-10 w-full max-w-[300px] border-y border-line py-7"
          data-reveal
          style={{ ["--reveal-delay" as string]: "200ms" }}
        >
          <p className="mb-5 text-center font-[family-name:var(--font-cormorant)] text-[15px] tracking-[0.34em] text-ink-2 uppercase">
            {new Date(Date.UTC(t.year, t.month - 1, 1)).toLocaleString("en-US", {
              month: "long",
              timeZone: "UTC",
            })}
          </p>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {DAY_HEAD.map((d, i) => (
              <span
                key={i}
                className={`font-mono text-[9.5px] tracking-[0.1em] ${
                  i === 0 ? "text-[#b98080]" : "text-ink-3"
                }`}
              >
                {d}
              </span>
            ))}

            {cells.map((day, i) => {
              const isWeddingDay = day === t.day;
              const isSunday = i % 7 === 0;
              return (
                <span key={i} className="flex h-9 items-center justify-center">
                  {day && (
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-full font-mono text-[12px] tnum transition-colors ${
                        isWeddingDay
                          ? "bg-accent font-medium text-paper"
                          : isSunday
                            ? "text-[#b98080]"
                            : "text-ink-2"
                      }`}
                    >
                      {day}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── 카운트다운 ── */}
        <div className="mt-9" data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}>
          <Countdown target={wedding.date} initial={countdown(wedding.date)} />
        </div>

        <div className="mt-8" data-reveal style={{ ["--reveal-delay" as string]: "180ms" }}>
          <AddToCalendar />
        </div>
      </div>
    </Section>
  );
}
