/* ─────────────────────────────────────────────────────────────
 *  ⚙️  여기만 고치면 청첩장이 완성됩니다.
 *
 *  아래 값들은 전부 예시(placeholder)입니다.
 *  실제 정보로 바꿔주세요. 코드는 건드릴 필요 없습니다.
 * ───────────────────────────────────────────────────────────── */

export type Person = {
  /** 표기용 전체 이름 */
  name: string;
  /** 이름(성 제외) — 큰 타이포에 사용 */
  given: string;
  /** 영문 표기 */
  en: string;
  /** 연락처 (전화/문자 바로걸기) */
  phone: string;
  /** 관계 표기: 장남 / 차남 / 장녀 / 차녀 ... */
  rank: string;
  father: Parent;
  mother: Parent;
};

export type Parent = {
  name: string;
  phone: string;
  /** 고인이신 경우 true → 이름 앞에 국화(菊) 표기 */
  late?: boolean;
};

export type Account = {
  /** 표시 라벨: 신랑, 아버지, 어머니 ... */
  label: string;
  holder: string;
  bank: string;
  number: string;
  /** 카카오페이 송금 링크 (선택). https://qr.kakaopay.com/... */
  kakaopay?: string;
};

/* ── 신랑 ───────────────────────────────────────────────── */
const groom: Person = {
  name: "김준일",
  given: "준일",
  en: "Junil",
  phone: "010-0000-0000", // TODO: 신랑 연락처
  rank: "아들", // 여동생만 있어 아들로는 외아들 → "장남"으로 바꾸셔도 됩니다.
  // 고인이신 경우 late: true 를 추가하면 이름 앞에 '故'가 붙고 연락처에서 숨겨집니다.
  father: { name: "김택년", phone: "010-0000-0000" },
  mother: { name: "이회영", phone: "010-0000-0000" },
};

/* ── 신부 ───────────────────────────────────────────────── */
const bride: Person = {
  name: "박건영",
  given: "건영",
  en: "Geonyoung", // 영문 표기는 원하시는 철자로 바꾸세요 (Gunyoung, Keonyoung 등)
  phone: "010-0000-0000", // TODO: 신부 연락처
  rank: "둘째딸", // 언니가 있어 딸 중 둘째
  father: { name: "박상정", phone: "010-0000-0000" },
  mother: { name: "강명숙", phone: "010-0000-0000" },
};

export const wedding = {
  /* ── 예식 ─────────────────────────────────────────────── */
  // ISO 8601, 한국 시간(+09:00) 기준으로 적어주세요.
  date: "2026-11-07T11:00:00+09:00",

  groom,
  bride,

  /* ── 예식장 ───────────────────────────────────────────── */
  venue: {
    name: "부전교회",
    hall: "3층 세움홀",
    // 교회 대표번호 (bujeon.org 안내). 예식 담당이 따로 있으면 그 번호로 바꾸세요.
    tel: "051-559-3900",
    // 출처: 부전교회 공식 홈페이지 "찾아오시는 길" (bujeon.org)
    address: "부산광역시 동래구 중앙대로 1276 (사직동)",
    addressDetail: "부전교회 3층 세움홀",
    // 부전교회 글로컬비전센터 (부산 동래구 중앙대로 1276) — 본당 정밀 좌표
    lat: 35.200195,
    lng: 129.07848,
    /** 지도 앱 바로가기 */
    naverMapUrl: "https://map.naver.com/p/search/%EB%B6%80%EC%A0%84%EA%B5%90%ED%9A%8C",
    kakaoMapUrl: "https://map.kakao.com/link/map/%EB%B6%80%EC%A0%84%EA%B5%90%ED%9A%8C,35.200195,129.07848",
    tmapUrl: "https://apis.openapi.sk.com/tmap/app/routes?appKey=&name=%EB%B6%80%EC%A0%84%EA%B5%90%ED%9A%8C&lon=129.07848&lat=35.200195",
  },

  /* ── 교통 안내 ─────────────────────────────────────────── */
  // 지하철은 신랑이 알려준 안내, 버스·주차는 부전교회 홈페이지(bujeon.org) 기준입니다.
  transport: [
    {
      label: "지하철",
      lines: [
        "1호선 교대역 10번 출구 · 도보 5~10분",
        "1호선 동래역 1번 출구 · 도보 5~10분",
      ],
    },
    {
      label: "버스",
      lines: [
        "일반 31, 43, 77, 100-1, 129-1, 506",
        "마을 부산진구17",
      ],
    },
    {
      label: "자가용",
      lines: [
        "내비게이션에 “부전교회” 또는 “중앙대로 1276” 검색",
        "교회 후면도로 → 지하주차장 입구 → 지하 2~4층 주차",
      ],
    },
  ],

  /* ── 인사말 ───────────────────────────────────────────── */
  greeting: {
    title: "저희, 결혼합니다",
    // 줄바꿈은 그대로 반영됩니다.
    body: `각자의 삶 멍에를 지고 살아가다
    서로를 만나 이제 함께 한 곳을
    바라보며 걸어가려 합니다.

귀한 걸음으로 축복해 주시면
더없는 기쁨으로 간직하겠습니다.`,
  },

  /* ── 갤러리 (13장) ────────────────────────────────────────
   * public/gallery/ 폴더에 01.jpg ~ 13.jpg 를 넣어주세요.
   * 세로 사진(3:4) 기준으로 디자인되어 있습니다.
   * ─────────────────────────────────────────────────────── */
  gallery: Array.from({ length: 13 }, (_, i) => ({
    src: `/gallery/${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `웨딩 사진 ${i + 1}`,
  })),

  /** 커버(메인)에 쓸 사진 — 9번 사진 (0부터 시작하므로 index 8) */
  coverIndex: 8,

  /* ── 마음 전하실 곳 ────────────────────────────────────── */
  accounts: {
    groom: [
      { label: "신랑", holder: "김준일", bank: "신한은행", number: "110-495-985622" },
      { label: "아버지", holder: "김택년", bank: "농협", number: "895-02-138277" },
      { label: "어머니", holder: "이회영", bank: "농협", number: "352-1736-0681-33" },
    ] as Account[],
    bride: [
      { label: "신부", holder: "박건영", bank: "농협", number: "302-1056-8462-31" },
      { label: "아버지", holder: "박상정", bank: "농협", number: "302-1189-9505-51" },
      { label: "어머니", holder: "강명숙", bank: "부산은행", number: "050-12-038949-0" },
    ] as Account[],
  },

  /* ── RSVP ─────────────────────────────────────────────── */
  rsvp: {
    // 응답 마감일 (이 날짜가 지나면 폼이 닫힙니다) — 비우면 예식일까지
    deadline: "2026-10-25T23:59:59+09:00",
    title: "참석 여부 전달",
    description: `축하의 마음으로 참석해 주시는 한 분 한 분,
정성껏 모시고 싶습니다.

식사 준비에 참고하고자 하오니
참석 여부를 알려주시면 감사하겠습니다.`,
  },

  /* ── 배경음악 ─────────────────────────────────────────────
   * public/bgm.m4a (또는 public/bgm.mp4) 음원을 재생합니다.
   * ─────────────────────────────────────────────────────── */
  bgm: {
    enabled: true,
    src: "/bgm.m4a",
    fallbackSrc: "/bgm.mp4",
    title: "합심 MR",
  },

  /* ── 공유 / SEO ───────────────────────────────────────── */
  meta: {
    // 실제 배포 도메인 (환경변수 NEXT_PUBLIC_SITE_URL 이 있으면 그쪽이 우선)
    url: "https://wedding.guwonsoft.com",
    title: "김준일 ♥ 박건영 결혼합니다",
    description: "2026년 11월 7일 토요일 오전 11시 · 부전교회 3층 세움홀",
    // 카톡/문자 공유 썸네일.
    // 비워두면 코드로 그린 이미지(app/opengraph-image.tsx)가 자동으로 쓰입니다.
    // 웨딩 사진을 쓰고 싶으면 public/og.jpg (1200x630) 를 넣고 "/og.jpg" 라고 적으세요.
    ogImage: "",
  },
};

export type WeddingConfig = typeof wedding;
