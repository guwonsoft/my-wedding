/**
 * 아주 가벼운 인메모리 레이트 리밋.
 *
 * 서버리스에서는 인스턴스마다 메모리가 따로라 완벽하지 않습니다.
 * 목적은 "실수로 연타" / 단순 스크립트를 걸러내는 정도이고,
 * 진짜 방어선은 각 라우트의 입력 검증과 허니팟입니다.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // 오래된 키 정리 (메모리 누수 방지)
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > windowMs)) hits.delete(k);
    }
  }
  return recent.length <= limit;
}

export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
