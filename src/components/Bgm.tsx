"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";

/**
 * 배경음악 토글.
 * - 브라우저 정책상 자동재생은 막히므로 "사용자가 켜는" 방식만 제공합니다.
 * - 파일(public/bgm.mp3)이 없으면 버튼 자체를 숨깁니다.
 */
export function Bgm() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!wedding.bgm.enabled) return;
    let cancelled = false;
    // HEAD 요청으로 파일 존재만 확인 — 없으면 조용히 사라집니다.
    fetch(wedding.bgm.src, { method: "HEAD" })
      .then((res) => !cancelled && setAvailable(res.ok))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!available) return null;

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    try {
      el.volume = 0.35;
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={wedding.bgm.src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "배경음악 끄기" : "배경음악 켜기"}
        aria-pressed={playing}
        className="fixed top-4 right-[max(16px,calc(50%-214px))] z-[65] grid h-9 w-9 place-items-center rounded-full border border-line/70 bg-paper/70 text-ink-2 backdrop-blur-md transition-colors active:bg-paper"
      >
        {playing ? (
          <span className="flex items-end gap-[2px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[2px] rounded-full bg-accent"
                style={{
                  height: 10,
                  animation: `eq 900ms ease-in-out ${i * 140}ms infinite alternate`,
                }}
              />
            ))}
          </span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6.5 12.6V4.4l6-1.2v8" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="4.9" cy="12.6" r="1.7" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="10.9" cy="11.2" r="1.7" stroke="currentColor" strokeWidth="1.1" />
          </svg>
        )}
      </button>
      <style>{`@keyframes eq { from { height: 3px } to { height: 12px } }`}</style>
    </>
  );
}
