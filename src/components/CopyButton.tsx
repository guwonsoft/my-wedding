"use client";

import { useEffect, useRef, useState } from "react";

/** 클립보드 복사 — HTTPS가 아니거나 권한이 막힌 환경에서도 동작하도록 폴백 포함 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 아래 폴백으로 */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label = "복사",
  doneLabel = "복사됨",
  className = "",
}: {
  value: string;
  label?: string;
  doneLabel?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(value);
        if (!ok) return;
        setDone(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setDone(false), 1600);
      }}
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] transition-colors duration-300 ${
        done ? "border-accent text-accent" : "border-line text-ink-3 active:bg-paper-2"
      } ${className}`}
    >
      {done ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="m1.5 6.2 3 3 6-6.4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <rect x="3.6" y="3.6" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8.4 1.6H2.4a1 1 0 0 0-1 1v6" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      )}
      {done ? doneLabel : label}
    </button>
  );
}
