"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { wedding } from "@/config/wedding";

/* 카카오맵 SDK 중 실제로 쓰는 부분만 좁게 타입 선언 */
type LatLng = object;
type MapInstance = {
  setCenter(p: LatLng): void;
  addControl(c: object, pos: unknown): void;
  setZoomable(z: boolean): void;
};
type KakaoMaps = {
  load(cb: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  Map: new (el: HTMLElement, opts: { center: LatLng; level: number }) => MapInstance;
  Marker: new (opts: { position: LatLng; map: MapInstance }) => unknown;
  ZoomControl: new () => object;
  ControlPosition: { RIGHT: unknown };
};
declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export function KakaoMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const init = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps || !ref.current) {
      setFailed(true);
      return;
    }
    maps.load(() => {
      if (!ref.current) return;
      const center = new maps.LatLng(wedding.venue.lat, wedding.venue.lng);
      const map = new maps.Map(ref.current, { center, level: 4 });
      new maps.Marker({ position: center, map });
      map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
      // 페이지를 스크롤하다 지도 위에서 갇히지 않도록 확대는 컨트롤로만.
      map.setZoomable(false);
    });
  }, []);

  // 키가 없거나 로드 실패 → 좌표를 그대로 보여주는 자리표시자
  if (!KAKAO_KEY || failed) return <MapPlaceholder configured={Boolean(KAKAO_KEY)} />;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={init}
        onError={() => setFailed(true)}
      />
      <div
        ref={ref}
        className="h-[240px] w-full bg-paper-3"
        role="img"
        aria-label={`${wedding.venue.name} 위치 지도`}
      />
    </>
  );
}

/** 지도 키가 없어도 화면이 비지 않도록 — 좌표/주소를 도면처럼 보여줍니다 */
function MapPlaceholder({ configured }: { configured: boolean }) {
  return (
    <div className="relative h-[240px] w-full overflow-hidden bg-paper-3">
      {/* 모눈 */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(35,32,28,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(35,32,28,0.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      {/* 십자선 */}
      <div className="absolute top-1/2 right-0 left-0 h-px bg-line" aria-hidden />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-line" aria-hidden />

      <div className="relative flex h-full flex-col items-center justify-center gap-2 text-center">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-accent bg-paper/80">
          <span className="h-2 w-2 rounded-full bg-accent" />
        </span>
        <p className="font-[family-name:var(--font-ko-serif)] text-[14px] text-ink">
          {wedding.venue.name}
        </p>
        <p className="font-mono text-[10px] tracking-[0.14em] text-ink-3 tnum">
          {wedding.venue.lat.toFixed(5)}, {wedding.venue.lng.toFixed(5)}
        </p>
        {!configured && (
          <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-ink-3/70">
            NEXT_PUBLIC_KAKAO_JS_KEY 미설정
          </p>
        )}
      </div>
    </div>
  );
}
