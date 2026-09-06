"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  { href: "#location", label: "오시는 길", icon: PinIcon },
  { href: "#rsvp", label: "참석 여부", icon: CheckIcon },
  { href: "#share", label: "공유", icon: ShareIcon },
];

/** 하단 고정 바 + 상단 스크롤 진행선 */
export function Dock() {
  const [progress, setProgress] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        // 커버를 지나면 등장
        setShown(window.scrollY > window.innerHeight * 0.85);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* 진행선 */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px]" aria-hidden>
        <div
          className="h-full origin-left bg-accent/70 transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* 하단 바 */}
      <nav
        aria-label="바로가기"
        className={`fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-[460px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-line/80 bg-paper/88 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <ul className="grid grid-cols-3">
            {ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <button
                  type="button"
                  onClick={() => go(href)}
                  className="flex w-full flex-col items-center gap-1.5 py-2.5 text-ink-2 transition-colors active:text-accent"
                >
                  <Icon />
                  <span className="text-[10px] tracking-[0.02em]">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 14s4.4-4 4.4-7A4.4 4.4 0 0 0 3.6 7c0 3 4.4 7 4.4 7Z" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="6.9" r="1.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="1.4" stroke="currentColor" strokeWidth="1.1" />
      <path d="m5.2 8.2 2 2 3.6-4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M11.2 2.4 13.6 4.8 5.6 12.8 2.4 13.6l.8-3.2 8-8Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 10.6V2.4m0 0L5.4 5M8 2.4 10.6 5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.4 8.6v4.2a.8.8 0 0 0 .8.8h7.6a.8.8 0 0 0 .8-.8V8.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
