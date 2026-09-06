"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { Photo } from "./Photo";

type Item = { src: string; alt: string };

export function Lightbox({
  items,
  index,
  onClose,
}: {
  items: readonly Item[];
  index: number;
  onClose: () => void;
}) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    startIndex: index,
    align: "center",
    duration: 22,
  });
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setCurrent(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex flex-col bg-[#141210]"
      style={{ animation: "lb-in 220ms ease-out" }}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-5 pt-[max(14px,env(safe-area-inset-top))] pb-3">
        <span className="font-mono text-[11px] tracking-[0.2em] text-white/60 tnum">
          {String(current + 1).padStart(2, "0")}
          <span className="mx-1 text-white/30">/</span>
          {String(items.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="-mr-2 grid h-9 w-9 place-items-center text-white/70 transition-colors hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 15 15" aria-hidden>
            <path d="M1 1l13 13M14 1L1 14" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      {/* 사진 */}
      <div className="relative min-h-0 flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {items.map((item, i) => (
            <div key={item.src} className="relative min-w-0 flex-[0_0_100%]">
              <div
                className="relative h-full w-full"
                style={{ animation: i === current ? "lb-zoom 320ms cubic-bezier(0.16,1,0.3,1)" : undefined }}
              >
                <Photo
                  src={item.src}
                  alt={item.alt}
                  index={i + 1}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 — 좌우 이동 + 점 인디케이터 */}
      <div className="flex items-center justify-center gap-6 px-5 pt-3 pb-[max(18px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={prev}
          aria-label="이전 사진"
          className="grid h-10 w-10 place-items-center text-white/55 transition-colors hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M10 2 4 8l6 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        <div className="flex max-w-[180px] flex-wrap items-center justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.src}
              type="button"
              aria-label={`${i + 1}번째 사진`}
              onClick={() => embla?.scrollTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "w-4 bg-white/85" : "w-1 bg-white/30"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label="다음 사진"
          className="grid h-10 w-10 place-items-center text-white/55 transition-colors hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="m6 2 6 6-6 6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
