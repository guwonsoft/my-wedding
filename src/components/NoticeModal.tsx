"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** 팝업이 닫힐 때 알리는 이벤트 — 배경음악(Bgm)이 이 신호를 받아 재생을 시작합니다. */
export const NOTICE_CLOSED_EVENT = "wedding:notice-closed";

export function NoticeModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 안내사항은 매 방문마다 반드시 보여드립니다. (숨김 저장 없음)
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // 커스텀 이벤트로 언제든 다시 열 수 있도록 지원
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-notice-modal", handleOpen);
    return () => window.removeEventListener("open-notice-modal", handleOpen);
  }, []);

  const close = () => {
    setOpen(false);
    // "확인했습니다"를 누르는 이 터치가 브라우저의 오디오 자동재생 잠금을 풀어주는 제스처입니다.
    // 이 순간에 배경음악을 시작해야 모바일에서도 확실히 재생됩니다.
    window.dispatchEvent(new CustomEvent(NOTICE_CLOSED_EVENT));
    window.dispatchEvent(new CustomEvent("user-interacted-with-page"));
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-modal-title"
      className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-ink/55 backdrop-blur-[4px] transition-all duration-300 animate-fade-in"
    >
      <div
        className="relative w-full max-w-[390px] max-h-[88dvh] overflow-y-auto rounded-[24px] border border-line/80 bg-[#fdfcf9] px-6 py-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] text-center outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 장식 및 제목 */}
        <div className="flex flex-col items-center">
          <span className="text-accent text-[15px] tracking-widest" aria-hidden>
            ✦ ✦ ✦
          </span>
          <p className="mt-1 font-mono text-[10px] tracking-[0.26em] text-ink-3 uppercase">
            Notice for Guests
          </p>
          <h2
            id="notice-modal-title"
            className="mt-2 font-[family-name:var(--font-ko-serif)] text-[18.5px] font-semibold tracking-tight text-ink"
          >
            소중한 분들께 드리는 안내 말씀
          </h2>
          <div className="my-4 h-px w-10 bg-line" />
        </div>

        {/* 3가지 정중한 안내 사항 */}
        <div className="space-y-4 text-left">
          {/* 1. 쌀화환 안내 */}
          <div className="rounded-[16px] border border-line/70 bg-paper/60 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent text-[12px]">
                🌾
              </span>
              <h3 className="font-[family-name:var(--font-ko-serif)] text-[14.5px] font-bold text-ink">
                사랑의 쌀화환 안내
              </h3>
            </div>
            <p className="text-[13px] leading-[1.75] text-ink-2 font-normal">
              축하의 마음으로 화환을 보내주시고자 하는 분들께서는 일반 화환 대신{" "}
              <b className="font-semibold text-ink">‘사랑의 쌀화환’</b>으로 마음을 전해 주시면 감사하겠습니다.
              <br />
              보내주신 소중한 쌀화환은 예식 후{" "}
              <span className="text-accent-2 font-medium">우리 주변의 어려운 이웃을 돕는 따뜻한 나눔</span>으로 전달될 예정입니다.
            </p>
          </div>

          {/* 2. 식사 인원 체크 부탁 */}
          <div className="rounded-[16px] border border-line/70 bg-paper/60 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent text-[12px]">
                🍽️
              </span>
              <h3 className="font-[family-name:var(--font-ko-serif)] text-[14.5px] font-bold text-ink">
                식사 인원 파악을 위한 체크 부탁
              </h3>
            </div>
            <p className="text-[13px] leading-[1.75] text-ink-2 font-normal">
              귀한 걸음 해주시는 하객 한 분 한 분을 정성껏 모시고자 합니다.
              정확한 뷔페 식사 준비를 위해, 번거로우시더라도 청첩장 하단의{" "}
              <b className="font-semibold text-ink">‘참석 여부(RSVP)’에서 참석 및 식사 여부</b>를 꼭 체크해 주시기를 간곡히 부탁드립니다.
            </p>
          </div>

          {/* 3. 예배식 진행 안내 */}
          <div className="rounded-[16px] border border-line/70 bg-paper/60 p-4 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/15 text-accent text-[12px]">
                ⛪
              </span>
              <h3 className="font-[family-name:var(--font-ko-serif)] text-[14.5px] font-bold text-ink">
                예배식 예식 진행 안내
              </h3>
            </div>
            <p className="text-[13px] leading-[1.75] text-ink-2 font-normal">
              저희 두 사람의 새로운 시작은 하나님과 양가 어르신, 소중한 하객 여러분 앞에서{" "}
              <b className="font-semibold text-ink">경건하고 은혜로운 ‘예배식’</b>으로 진행됩니다.
              함께 기도와 축복의 마음으로 예배에 동참해 주시면 더없는 기쁨과 감사가 되겠습니다.
            </p>
          </div>
        </div>

        {/* 맺음말 */}
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-3">
          따뜻한 격려와 축복을 보내주시는 모든 분들께<br />
          마음 깊이 감사의 인사를 올립니다.
        </p>

        {/* 버튼 영역 — 닫는 방법은 이 버튼 하나뿐입니다. */}
        <div className="mt-6">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-[14px] bg-accent py-3 font-[family-name:var(--font-ko-serif)] text-[14.5px] font-medium text-white shadow-sm transition-all duration-200 hover:opacity-95 active:scale-[0.99]"
          >
            확인했습니다
          </button>
          <p className="mt-2.5 font-mono text-[10px] tracking-wider text-ink-3">
            확인을 누르시면 배경음악이 함께 시작됩니다 🎵
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** 언제든 안내사항 팝업을 다시 열 수 있는 버튼 */
export function NoticeButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-notice-modal"))}
      className="group inline-flex items-center gap-2 border border-line px-5 py-3 font-mono text-[10.5px] tracking-[0.2em] text-ink-2 uppercase transition-colors duration-300 hover:border-accent hover:text-accent active:bg-paper-2"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="6.8" stroke="currentColor" strokeWidth="1.1" />
        <path d="M8 7v4.2M8 4.8h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      예식 안내사항
    </button>
  );
}

