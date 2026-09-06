"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";

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
  CustomOverlay: new (opts: { position: LatLng; content: string; yAnchor?: number }) => {
    setMap(map: MapInstance | null): void;
  };
  ZoomControl: new () => object;
  ControlPosition: { RIGHT: unknown };
};

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "0e19f5e6eb22ae7e17f5219094123eed";

export function KakaoMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const initMap = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps || !containerRef.current) {
      return;
    }

    maps.load(() => {
      if (!containerRef.current) return;
      try {
        const center = new maps.LatLng(wedding.venue.lat, wedding.venue.lng);
        const map = new maps.Map(containerRef.current, { center, level: 3 });

        // 마커 생성
        new maps.Marker({
          position: center,
          map,
        });

        // 예식장 위치 안내 말풍선 (커스텀 오버레이)
        const overlayContent = `
          <div style="
            background: #ffffff;
            padding: 6px 14px;
            border-radius: 16px;
            border: 1px solid #d9d4cc;
            box-shadow: 0 4px 14px rgba(35, 32, 28, 0.16);
            font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
            font-size: 12.5px;
            font-weight: 600;
            color: #23201c;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
          ">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#8c7b70;"></span>
            ${wedding.venue.name} <span style="font-size:11.5px;color:#7a7267;font-weight:400;">(${wedding.venue.hall})</span>
          </div>
        `;

        const overlay = new maps.CustomOverlay({
          position: center,
          yAnchor: 2.15,
          content: overlayContent,
        });
        overlay.setMap(map);

        // 확대/축소 컨트롤
        map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
        // 스크롤 갇힘 방지 (확대는 우측 버튼으로만)
        map.setZoomable(false);
        setLoaded(true);
      } catch (err) {
        console.error("Kakao map init error:", err);
        setError(true);
      }
    });
  }, []);

  // 이미 카카오 스크립트가 로드되어 있는 경우 즉시 초기화
  useEffect(() => {
    if (window.kakao?.maps) {
      initMap();
    }
  }, [initMap]);

  return (
    <div className="relative h-[280px] w-full overflow-hidden bg-paper-3">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
        onReady={initMap}
        onError={() => setError(true)}
      />

      <div
        id="kakao-map-container"
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label={`${wedding.venue.name} 카카오맵 위치 지도`}
      />

      {/* 로딩 표시 */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper-2 text-ink-3">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="font-mono text-[11px] tracking-wider">카카오맵을 불러오는 중입니다...</span>
        </div>
      )}

      {/* 도메인 미등록 등으로 로드 실패 시 안내 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-paper-2">
          <p className="font-[family-name:var(--font-ko-serif)] text-[14px] font-semibold text-ink">
            카카오맵 로드 대기 중
          </p>
          <p className="mt-1 text-[12px] text-ink-2 leading-relaxed max-w-[280px]">
            카카오 개발자 콘솔에서 도메인(<code className="font-mono text-accent">http://localhost:3000</code>) 등록을 확인해 주세요.
          </p>
          <p className="mt-2 font-mono text-[10px] text-ink-3">
            좌표: {wedding.venue.lat}, {wedding.venue.lng}
          </p>
        </div>
      )}
    </div>
  );
}
