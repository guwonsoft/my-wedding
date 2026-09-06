const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** Date를 한국시간 기준 연/월/일/요일/시/분으로 분해 */
export function kst(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const shifted = new Date(d.getTime() + KST_OFFSET_MS);
  return {
    date: d,
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
    weekdayKo: DAY_KO[shifted.getUTCDay()],
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

/** "2026년 11월 14일 토요일 오후 1시" */
export function formatKoreanDateTime(iso: string): string {
  const t = kst(iso);
  const meridiem = t.hour < 12 ? "오전" : "오후";
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const minute = t.minute ? ` ${t.minute}분` : "";
  return `${t.year}년 ${t.month}월 ${t.day}일 ${t.weekdayKo}요일 ${meridiem} ${h12}시${minute}`;
}

/** "2026.11.14 SAT PM 1:00" — 모노스페이스 라벨용 */
export function formatStamp(iso: string): string {
  const t = kst(iso);
  const en = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][t.weekday];
  const meridiem = t.hour < 12 ? "AM" : "PM";
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.year}.${p(t.month)}.${p(t.day)} ${en} ${meridiem} ${h12}:${p(t.minute)}`;
}

/** 해당 월의 달력 격자 (앞뒤 빈 칸은 null) */
export function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startPad = first.getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = Array(startPad).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** 지금부터 목표 시각까지 남은 시간 */
export function countdown(target: string, now = Date.now()) {
  const diff = new Date(target).getTime() - now;
  const clamped = Math.max(diff, 0);
  const sec = Math.floor(clamped / 1000);
  return {
    passed: diff <= 0,
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
    /** 자정 기준 D-day (D-30 처럼 표기용) */
    dday: Math.ceil(diff / 86400000),
  };
}
