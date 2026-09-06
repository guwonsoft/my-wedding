"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type PhotoProps = Omit<ImageProps, "onError" | "onLoad"> & {
  /** 사진이 아직 없을 때 자리표시자에 표시할 번호 */
  index?: number;
};

/** .jpg 가 없으면 같은 이름의 .png 를 한 번 더 시도합니다 (npm run placeholders 대응) */
function fallbackSrc(src: ImageProps["src"]): string | null {
  if (typeof src !== "string") return null;
  const match = /^(.*)\.(jpg|jpeg)$/i.exec(src);
  return match ? `${match[1]}.png` : null;
}

/**
 * next/image + 두 가지 안전장치
 *  1. 로딩 전에는 종이색 자리를 잡아둬서 레이아웃이 튀지 않습니다.
 *  2. 파일이 아직 없으면 도형 자리표시자로 대체 — 사진을 넣기 전에도
 *     전체 디자인을 그대로 확인할 수 있습니다.
 */
export function Photo({ index, className = "", alt, src, ...props }: PhotoProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [current, setCurrent] = useState(src);

  const onError = () => {
    const next = fallbackSrc(current);
    if (next) {
      setCurrent(next);
      setState("loading");
      return;
    }
    setState("error");
  };

  if (state === "error") {
    // next/image의 `fill`은 style로 absolute inset-0을 넣어줍니다.
    // 자리표시자는 그 혜택을 못 받으므로 직접 채워줍니다.
    return (
      <div
        className={`flex items-center justify-center bg-paper-3 ${
          props.fill ? "absolute inset-0 h-full w-full" : ""
        } ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="flex flex-col items-center gap-2 text-ink-3">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M3 17.5V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="8.5" cy="10" r="1.4" stroke="currentColor" strokeWidth="1" />
            <path d="m4 16.5 4.6-4.2 3.5 3 3-2.4L20 17" stroke="currentColor" strokeWidth="1" />
          </svg>
          {index != null && (
            <span className="font-mono text-[10px] tracking-[0.2em] tnum">
              {String(index).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // preload 사진(커버)은 이 페이지의 LCP입니다.
  // 서버가 만든 HTML에 opacity-0이 박히면 preload를 해두고도 하이드레이션 전까지
  // 화면이 비어 있게 되므로, 커버만은 페이드 없이 즉시 보이게 합니다.
  // (Next 16에서 priority는 deprecated → preload. 옛 prop도 함께 봅니다.)
  const fade = !props.preload && !props.priority;

  return (
    <>
      <Image
        {...props}
        key={typeof current === "string" ? current : undefined}
        src={current}
        alt={alt}
        className={`${className} ${
          fade
            ? `transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                state === "ready" ? "opacity-100" : "opacity-0"
              }`
            : ""
        }`}
        onLoad={() => setState("ready")}
        onError={onError}
      />
      {state === "loading" && <span className="absolute inset-0 -z-10 bg-paper-3" aria-hidden />}
    </>
  );
}
