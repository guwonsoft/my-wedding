"use client";

import { useEffect, useState } from "react";
import { countdown } from "@/lib/date";

type Snapshot = ReturnType<typeof countdown>;

/**
 * 예식까지 남은 시간. 서버에서 계산한 값으로 첫 렌더를 맞춘 뒤
 * (하이드레이션 불일치 방지) 마운트되면 1초마다 갱신합니다.
 */
export function Countdown({ target, initial }: { target: string; initial: Snapshot }) {
  const [t, setT] = useState(initial);

  useEffect(() => {
    const tick = () => setT(countdown(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "DAYS", value: t.days },
    { label: "HOURS", value: t.hours },
    { label: "MIN", value: t.minutes },
    { label: "SEC", value: t.seconds },
  ];

  return (
    <div>
      <div className="flex items-end justify-center gap-1">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-end">
            <div className="flex w-[52px] flex-col items-center gap-1.5">
              <span className="font-[family-name:var(--font-cormorant)] text-[30px] leading-none font-light tnum text-ink">
                {String(u.value).padStart(2, "0")}
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-ink-3">{u.label}</span>
            </div>
            {i < units.length - 1 && (
              <span className="mb-[22px] font-[family-name:var(--font-cormorant)] text-[22px] leading-none text-line">
                :
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[13.5px] tracking-[0.02em] text-ink-2">
        {t.passed ? (
          <>함께해 주셔서 감사합니다.</>
        ) : (
          <>
            <span className="font-[family-name:var(--font-ko-serif)] text-ink">두 사람</span>의
            결혼식이{" "}
            <span className="font-mono text-accent tnum">{Math.max(t.dday, 0)}</span>일 남았습니다.
          </>
        )}
      </p>
    </div>
  );
}
