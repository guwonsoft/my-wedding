"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";

export function Bgm() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);
  const [toastVisible, setToastVisible] = useState(true);
  const [toastState, setToastState] = useState<"counting" | "playing" | "blocked">("counting");
  const [countdown, setCountdown] = useState(5);
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

  // 5초 카운트다운 및 자동 재생 시도
  useEffect(() => {
    if (!available) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const playTimer = setTimeout(async () => {
      if (userMutedRef.current) return;
      const el = audioRef.current;
      if (!el) return;

      try {
        el.volume = 0.35;
        await el.play();
        setPlaying(true);
        setToastState("playing");
        // 재생 성공 후 4초 뒤 안내 토스트 자동 닫힘
        setTimeout(() => setToastVisible(false), 4000);
      } catch {
        // 브라우저 자동재생 정책에 의해 차단된 경우 (사용자 인터랙션 필요)
        setToastState("blocked");
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(playTimer);
    };
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
          aria-label="배경음악 재생 및 음소거 안내"
          className="fixed top-3 left-4 right-[60px] z-[65] mx-auto max-w-[340px] animate-fade-in transition-all duration-300"
        >
          <div className="relative overflow-hidden rounded-[18px] border border-line/80 bg-paper/95 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
            {/* 상단 5초 진행 바 (카운트다운 중일 때) */}
            {toastState === "counting" && (
              <div className="absolute top-0 left-0 h-[2.5px] w-full bg-line/50">
                <div
                  className="h-full bg-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-[12px]">
                🎵
              </span>

              <div className="flex-1 pr-1">
                {toastState === "counting" && (
                  <>
                    <p className="text-[12.5px] font-semibold text-ink leading-tight">
                      {countdown > 0 ? `${countdown}초 뒤 배경음악이 재생됩니다` : "배경음악을 시작합니다"}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-2 leading-relaxed">
                      소리를 끄고 싶으시면 우측 상단{" "}
                      <span className="font-semibold text-ink inline-flex items-center">
                        음소거 버튼(🔇)
                      </span>
                      을 눌러주세요.
                    </p>
                  </>
                )}

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
