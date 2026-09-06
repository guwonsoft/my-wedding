"use client";

import { useSyncExternalStore } from "react";

/** 구독할 외부 소스가 없는 스냅샷 — 구독 해제 함수만 돌려줍니다. */
const noSubscribe = () => () => {};

/**
 * 하이드레이션이 끝났는지 (= 브라우저에서 렌더 중인지).
 *
 * `useEffect(() => setMounted(true))` 대신 씁니다.
 * 이 방식은 렌더를 한 번 더 돌리지 않고, 서버 스냅샷이 명시적이라
 * 하이드레이션 불일치가 구조적으로 생기지 않습니다.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

/**
 * 서버에서는 알 수 없는 값(현재 시각, localStorage 등)을 안전하게 읽습니다.
 *
 * 서버/첫 렌더에서는 `serverValue`를, 하이드레이션 이후에는 `compute()`를 사용합니다.
 * compute는 같은 렌더 안에서 항상 같은 값을 돌려줘야 합니다.
 */
export function useClientValue<T>(compute: () => T, serverValue: T): T {
  return useSyncExternalStore(noSubscribe, compute, () => serverValue);
}
