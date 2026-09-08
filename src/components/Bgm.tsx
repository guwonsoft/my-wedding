"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { NOTICE_CLOSED_EVENT } from "./NoticeModal";

export function Bgm() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastState, setToastState] = useState<"playing" | "blocked">("playing");
  const userMutedRef = useRef(false);

  // 음원 파일 존재 확인
  useEffect(() => {
    if (!wedding.bgm.enabled) return;
    let cancelled = false;
    fetch(wedding.bgm.src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok || res.status === 200 || res.status === 206);
      })
      .catch(() => {
        if (!cancelled) setAvailable(true); // 에러 나더라도 정적 파일 시도
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 안내 팝업의 "확인했습니다"를 누르는 순간 재생을 시작합니다.
   *
   * 모바일 브라우저는 사용자 제스처 없이는 오디오를 막습니다.
   * 팝업을 닫는 그 터치가 바로 그 제스처라, 타이머로 몰래 트는 것보다 훨씬 확실합니다.
   */
  useEffect(() => {
    if (!available) return;

    const start = async () => {
      if (userMutedRef.current) return;
      const el = audioRef.current;
      if (!el || !el.paused) return;

      try {
        el.volume = 0.35;
        await el.play();
        setPlaying(true);
        setToastState("playing");
        setToastVisible(true);
        // 재생 안내 토스트는 4초 뒤 스스로 닫힘
        setTimeout(() => setToastVisible(false), 4000);
      } catch {
        // 그래도 막혔다면 화면 아무 곳이나 터치하도록 안내
        setToastState("blocked");
        setToastVisible(true);
      }
    };

    window.addEventListener(NOTICE_CLOSED_EVENT, start);
    return () => window.removeEventListener(NOTICE_CLOSED_EVENT, start);
  }, [available]);

  // 브라우저 정책으로 차단된 경우 하객의 첫 터치/클릭 시 재생
  useEffect(() => {
    if (!available || playing) return;

    const handleInteraction = async () => {
      if (userMutedRef.current) return;
      const el = audioRef.current;
      if (!el || playing) return;

      try {
        el.volume = 0.35;
        await el.play();
        setPlaying(true);
        setToastState("playing");
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3500);
      } catch {
        /* 무시 */
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("user-interacted-with-page", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("user-interacted-with-page", handleInteraction);
    };
  }, [available, playing]);

  if (!available) return null;

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
      userMutedRef.current = true;
      setToastVisible(false);
    } else {
      userMutedRef.current = false;
      try {
        el.volume = 0.35;
        await el.play();
        setPlaying(true);
        setToastState("playing");
        setTimeout(() => setToastVisible(false), 3000);
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} loop preload="auto">
        <source src={wedding.bgm.src} type="audio/mp4" />
        <source src="/bgm.m4a" type="audio/mp4" />
        <source src="/bgm.mp4" type="audio/mp4" />
      </audio>

      {/* 안내 토스트 (5초 카운트다운 및 음소거 안내) */}
      {toastVisible && (
        <aside
          role="status"
          aria-live="polite"
          aria-label="배경음악 안내"
          className="fixed top-3 left-4 right-[60px] z-[65] mx-auto max-w-[340px] animate-fade-in transition-all duration-300"
        >
          <div className="relative overflow-hidden rounded-[18px] border border-line/80 bg-paper/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-[12px]">
                🎵
              </span>

              <div className="flex-1 pr-1">
                {toastState === "playing" && (
                  <>
                    <p className="text-[12.5px] font-semibold text-accent leading-tight">
                      배경음악이 재생 중입니다 🎶
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-2 leading-relaxed">
                      소리를 끄시려면 우측 상단 음소거 버튼을 눌러주세요.
                    </p>
                  </>
                )}

                {toastState === "blocked" && (
                  <>
                    <p className="text-[12.5px] font-semibold text-ink leading-tight">
                      배경음악 안내 🎵
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-2 leading-relaxed">
                      화면을 가볍게 터치하시면 음악이 시작됩니다. (소리를 끄시려면 우측 상단 음소거 버튼)
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setToastVisible(false)}
                aria-label="안내 닫기"
                className="grid h-6 w-6 place-items-center text-ink-3 hover:text-ink transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 우측 상단 음소거/재생 플로팅 버튼 */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "배경음악 음소거 (소리 끄기)" : "배경음악 켜기"}
        aria-pressed={playing}
        title={playing ? "음소거" : "음악 켜기"}
        className={`fixed top-3.5 right-[max(14px,calc(50%-216px))] z-[70] grid h-10 w-10 place-items-center rounded-full border shadow-md backdrop-blur-md transition-all active:scale-95 ${
          playing
            ? "border-accent/60 bg-paper/90 text-accent"
            : "border-line/80 bg-paper/85 text-ink-3 hover:text-ink-2"
        }`}
      >
        {playing ? (
          /* 재생 중: 이퀄라이저 애니메이션 */
          <span className="flex items-end gap-[2.5px]" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-accent"
                style={{
                  height: 12,
                  animation: `eq 850ms ease-in-out ${i * 120}ms infinite alternate`,
                }}
              />
            ))}
          </span>
        ) : (
          /* 음소거 상태: 음소거 스피커 아이콘 */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M11 5L6 9H2v6h4l5 4V5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 9l-6 6M17 9l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <style>{`@keyframes eq { from { height: 3px } to { height: 13px } }`}</style>
    </>
  );
}
