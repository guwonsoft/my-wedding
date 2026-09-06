"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { Section, SectionLabel } from "./ui";
import { Photo } from "./Photo";
import { Lightbox } from "./Lightbox";

/**
 * 14장 레이아웃:
 *   1장은 와이드로 크게, 나머지 13장은 3열 그리드.
 *   13은 3으로 안 나눠떨어지므로 마지막 줄(1장)은 가운데 정렬 대신
 *   가로로 넓게 깔아 여백이 어색해지지 않게 합니다.
 */
export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = wedding.gallery;
  const [lead, ...rest] = photos;

  const tail = rest.length % 3; // 마지막 줄에 남는 장수

  return (
    <Section id="gallery">
      <div className="flex flex-col items-center">
        <SectionLabel index={3} en="Gallery" ko="우리의 순간" />
        <p
          className="mt-4 font-mono text-[10px] tracking-[0.18em] text-ink-3 tnum"
          data-reveal
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          {String(photos.length).padStart(2, "0")} PHOTOS · TAP TO ENLARGE
        </p>
      </div>

      <div className="mt-9 space-y-1.5">
        {/* 대표 사진 */}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="relative block aspect-[4/5] w-full overflow-hidden bg-paper-3"
          data-reveal="scale"
          aria-label={`${lead.alt} 크게 보기`}
        >
          <Photo
            src={lead.src}
            alt={lead.alt}
            index={1}
            fill
            sizes="(max-width: 460px) 100vw, 460px"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[1.02]"
          />
        </button>

        {/* 나머지 */}
        <div className="grid grid-cols-3 gap-1.5">
          {rest.map((photo, i) => {
            const isLastRowSingle = tail === 1 && i === rest.length - 1;
            const isLastRowDouble = tail === 2 && i >= rest.length - 2;
            return (
              <button
                key={photo.src}
                type="button"
                onClick={() => setOpen(i + 1)}
                aria-label={`${photo.alt} 크게 보기`}
                className={`relative block overflow-hidden bg-paper-3 ${
                  isLastRowSingle ? "col-span-3 aspect-[16/9]" : ""
                } ${isLastRowDouble ? "aspect-[3/4]" : ""} ${
                  !isLastRowSingle && !isLastRowDouble ? "aspect-[3/4]" : ""
                }`}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${Math.min(i, 8) * 45}ms` }}
              >
                <Photo
                  src={photo.src}
                  alt={photo.alt}
                  index={i + 2}
                  fill
                  sizes="(max-width: 460px) 33vw, 150px"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[1.04]"
                />
              </button>
            );
          })}
        </div>
      </div>

      {open !== null && (
        <Lightbox items={photos} index={open} onClose={() => setOpen(null)} />
      )}
    </Section>
  );
}
