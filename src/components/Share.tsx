"use client";

import Script from "next/script";
import { useCallback, useState } from "react";
import { wedding } from "@/config/wedding";
import { formatKoreanDateTime } from "@/lib/date";
import { Section, SectionLabel } from "./ui";
import { copyText } from "./CopyButton";

type KakaoSdk = {
  isInitialized(): boolean;
  init(key: string): void;
  Share: {
    sendDefault(settings: Record<string, unknown>): void;
  };
};
declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export function Share() {
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin + window.location.pathname : wedding.meta.url;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const shareKakao = useCallback(() => {
    const kakao = window.Kakao;
    if (!kakao || !KAKAO_KEY) return;
    if (!kakao.isInitialized()) kakao.init(KAKAO_KEY);

    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: wedding.meta.title,
        description: `${formatKoreanDateTime(wedding.date)}\n${wedding.venue.name} ${wedding.venue.hall}`,
        imageUrl: new URL(wedding.meta.ogImage || "/opengraph-image", wedding.meta.url).toString(),
        link: { mobileWebUrl: wedding.meta.url, webUrl: wedding.meta.url },
      },
      buttons: [
        {
          title: "청첩장 보기",
          link: { mobileWebUrl: wedding.meta.url, webUrl: wedding.meta.url },
        },
      ],
    });
  }, []);

  const shareSystem = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: wedding.meta.title,
          text: wedding.meta.description,
          url: siteUrl,
        });
        return;
      } catch {
        /* 사용자가 취소 — 조용히 무시 */
        return;
      }
    }
    flash((await copyText(siteUrl)) ? "링크가 복사되었습니다" : "복사에 실패했습니다");
  }, [siteUrl]);

  const copyLink = useCallback(async () => {
    flash((await copyText(siteUrl)) ? "링크가 복사되었습니다" : "복사에 실패했습니다");
  }, [siteUrl]);

  const buttons = [
    ...(KAKAO_KEY
      ? [
          {
            label: "카카오톡",
            icon: <KakaoIcon />,
            onClick: shareKakao,
            disabled: !ready,
            brand: true,
          },
        ]
      : []),
    { label: "공유하기", icon: <ShareIcon />, onClick: shareSystem, disabled: false, brand: false },
    { label: "링크복사", icon: <LinkIcon />, onClick: copyLink, disabled: false, brand: false },
  ];

  return (
    <Section id="share">
      {KAKAO_KEY && (
        <Script
          // SRI 해시를 쓰고 싶다면 Kakao 개발자 문서의 공식 integrity 값을 그대로 붙여넣으세요.
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          crossOrigin="anonymous"
          strategy="lazyOnload"
          onReady={() => setReady(true)}
        />
      )}

      <div className="flex flex-col items-center text-center">
        <SectionLabel index={8} en="Share" ko="청첩장 공유하기" />

        {/* 카카오 키가 없으면 카톡 버튼은 빠집니다 — 남은 개수에 맞춰 칸을 나눕니다. */}
        <div
          className="mt-8 grid w-full gap-1.5"
          style={{ gridTemplateColumns: `repeat(${buttons.length}, minmax(0, 1fr))` }}
          data-reveal
        >
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={b.onClick}
              disabled={b.disabled}
              className="flex flex-col items-center gap-2 border border-line py-5 transition-colors active:bg-paper-2 disabled:opacity-40"
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full ${
                  b.brand ? "bg-[#FEE500] text-[#3C1E1E]" : "border border-line text-ink-2"
                }`}
              >
                {b.icon}
              </span>
              <span className="text-[11.5px] text-ink-2">{b.label}</span>
            </button>
          ))}
        </div>

        <div
          aria-live="polite"
          className={`mt-4 font-mono text-[10.5px] tracking-[0.14em] text-accent transition-opacity duration-300 ${
            toast ? "opacity-100" : "opacity-0"
          }`}
        >
          {toast || " "}
        </div>
      </div>
    </Section>
  );
}

function KakaoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 2.2c-3.4 0-6.2 2.2-6.2 4.9 0 1.7 1.1 3.2 2.8 4.1l-.7 2.6c-.1.2.2.4.4.3l3-2c.2 0 .5.1.7.1 3.4 0 6.2-2.2 6.2-4.9S11.4 2.2 8 2.2Z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 10.6V2.4m0 0L5.4 5M8 2.4 10.6 5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.4 8.6v4.2a.8.8 0 0 0 .8.8h7.6a.8.8 0 0 0 .8-.8V8.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 1 0-3.7-3.7l-.9.9" stroke="currentColor" strokeWidth="1.1" />
      <path d="M9.4 6.6a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 1 0 3.7 3.7l.9-.9" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
