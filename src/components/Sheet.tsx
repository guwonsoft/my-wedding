"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/hooks/useClient";

/**
 * 아래에서 올라오는 바텀시트.
 *
 * 열림/닫힘 상태를 별도 state로 복제하지 않습니다.
 * 닫힐 때의 퇴장 애니메이션은 CSS의 `visibility` 전환 지연으로 처리합니다.
 * (`.sheet-root` 규칙 — globals.css)  덕분에 이 컴포넌트에는 타이머도, 파생 state도 없습니다.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!hydrated) return null;

  return createPortal(
    <div
      className={`sheet-root fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      data-open={open}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label={title}
    >
      <button
        type="button"
        aria-label="닫기"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[460px]">
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`max-h-[82dvh] overflow-y-auto rounded-t-[22px] bg-paper pb-[max(24px,env(safe-area-inset-bottom))] shadow-[0_-12px_48px_-12px_rgba(35,32,28,0.35)] outline-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line/70 bg-paper/95 px-6 pt-4 pb-3 backdrop-blur">
            <span className="font-mono text-[10px] tracking-[0.28em] text-ink-3 uppercase">
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              tabIndex={open ? 0 : -1}
              className="-mr-2 grid h-8 w-8 place-items-center text-ink-2 transition-colors hover:text-ink"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </button>
          </div>
          <div className="px-6 pt-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** 시트를 여는 얇은 아웃라인 버튼 — 여러 섹션에서 재사용 */
export function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 border border-line px-5 py-3 font-mono text-[10.5px] tracking-[0.2em] text-ink-2 uppercase transition-colors duration-300 hover:border-accent hover:text-accent active:bg-paper-2 ${className}`}
    >
      {children}
    </button>
  );
}
