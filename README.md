# 김준일 ♥ 박건영 — 모바일 청첩장

2026년 11월 7일 토요일 오전 11시 · 부전교회 3층 세움홀

Next.js 16 · React 19 · Tailwind CSS v4 · Supabase 로 만든 모바일 청첩장입니다.
**참석 여부(RSVP)를 받아 뷔페 인원을 미리 집계**하는 것이 핵심 기능입니다.

---

## 1. 화면 구성

| 순서 | 섹션 | 내용 |
|---|---|---|
| — | 커버 | 대표 사진 · 이름 · 일시 |
| 01 | 초대합니다 | 인사말 · 혼주/신랑신부 · 연락하기(전화·문자) |
| 02 | 예식 안내 | 달력 · D-day 카운트다운 · 캘린더 저장(.ics / 구글) |
| 03 | 갤러리 | 사진 14장 · 스와이프 라이트박스 |
| 04 | 오시는 길 | 지도 · 주소 복사 · 카카오맵/네이버지도/T맵 · 교통 안내 |
| 05 | **참석 여부** | **참석·인원·식사 여부 수집** |
| 06 | 마음 전하실 곳 | 계좌 아코디언 · 복사 · 카카오페이 |
| 07 | 축하 한마디 | 방명록 (비밀번호로 본인 삭제) |
| 08 | 공유하기 | 카카오톡 · 시스템 공유 · 링크 복사 |

부가 기능: 하단 고정 바, 상단 스크롤 진행선, 배경음악 토글, 스크롤 등장 애니메이션,
자동 생성 공유 썸네일(OG), `/admin` 집계 대시보드.

---

## 2. 시작하기 (로컬)

```bash
npm install
cp .env.example .env.local   # 값 채우기 (아래 3번)
npm run dev
```

http://localhost:3000 에서 확인합니다.

사진이 아직 없다면 레이아웃 미리보기용 임시 사진을 만들 수 있습니다.

```bash
npm run placeholders
```

실제 사진을 넣은 뒤에는 `npm run placeholders:clean` 으로 지우세요.

---

## 3. 내용 채우기

### 3-1. 청첩장 정보 — `src/config/wedding.ts` 한 파일만 고치면 됩니다

`// TODO` 로 표시된 곳이 아직 채워지지 않은 값입니다.

- [ ] 신랑·신부·혼주 **연락처**
- [ ] 예식장 **전화번호**
- [ ] 예식장 **주소와 좌표** (`address`, `lat`, `lng`) — 카카오맵에서 "부전교회" 검색 후 복사
- [ ] **교통 안내** (`transport`)
- [ ] **계좌번호** (`accounts`)
- [ ] 인사말 문구 (`greeting`)
- [ ] RSVP 마감일 (`rsvp.deadline`) — 기본값 2026-10-25

### 3-2. 사진

`public/gallery/` 에 `01.jpg` ~ `14.jpg` 를 넣습니다. 자세한 규격은 그 폴더의 README 참고.
`01.jpg` 가 커버 사진이며, `wedding.coverIndex` 로 바꿀 수 있습니다.

### 3-3. 배경음악 (선택)

`public/bgm.mp3` 를 넣으면 우측 상단에 재생 버튼이 자동으로 생깁니다.
파일이 없으면 버튼 자체가 나타나지 않습니다. **저작권에 유의하세요.**

---

## 4. Supabase 연결 (참석 여부·방명록 저장)

1. https://supabase.com 에서 프로젝트를 만듭니다. (Region은 `Northeast Asia (Seoul)` 권장)
2. 대시보드 → **SQL Editor** → `supabase/schema.sql` 내용을 붙여넣고 **Run**.
3. **Project Settings → API** 에서 두 값을 복사해 `.env.local` 에 넣습니다.

```bash
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> ⚠️ `service_role` 키는 **절대 공개되면 안 됩니다.**
> 이 프로젝트는 브라우저가 DB에 직접 붙지 않고 서버(Route Handler)만 이 키를 사용하며,
> `src/lib/supabase.ts` 는 `server-only` 로 잠겨 있어 클라이언트에서 import 하면 빌드가 실패합니다.
> 두 테이블 모두 RLS를 켜고 정책을 만들지 않았으므로, 외부에서는 아무것도 읽거나 쓸 수 없습니다.

4. 관리자 비밀번호를 정합니다. `/admin` 로그인에 쓰입니다.

```bash
ADMIN_PASSWORD=충분히-긴-비밀번호
```

---

## 5. 카카오 연동 (선택)

지도와 카카오톡 공유하기에 쓰입니다. **없어도 청첩장은 정상 동작합니다**
(지도는 좌표 안내 화면으로, 공유는 시스템 공유/링크 복사로 대체됩니다).

1. https://developers.kakao.com → 내 애플리케이션 → 추가
2. **앱 키 → JavaScript 키** 를 `NEXT_PUBLIC_KAKAO_JS_KEY` 에 넣습니다.
3. **플랫폼 → Web → 사이트 도메인** 에 아래를 모두 등록합니다.
   - `http://localhost:3000`
   - `https://wedding.guwonsoft.com`
4. 카카오톡 공유를 쓰려면 **카카오 로그인 → 활성화** 없이도 되지만,
   **제품 설정 → 카카오톡 공유** 가 켜져 있어야 합니다.

> 도메인 등록을 빠뜨리면 지도만 빈 화면으로 나옵니다. 가장 흔한 실수입니다.

---

## 6. Vercel 배포

```bash
git init && git add -A && git commit -m "feat: 모바일 청첩장"
gh repo create wedding-invitation --private --source=. --push
```

1. https://vercel.com/new 에서 이 저장소를 Import 합니다. (설정은 전부 기본값)
2. **Environment Variables** 에 `.env.local` 과 같은 값을 넣습니다.
   `NEXT_PUBLIC_SITE_URL` 만 `https://wedding.guwonsoft.com` 으로 바꿉니다.

| 이름 | 공개 여부 |
|---|---|
| `SUPABASE_URL` | 서버 전용 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 · 절대 노출 금지 |
| `ADMIN_PASSWORD` | 서버 전용 |
| `NEXT_PUBLIC_SITE_URL` | 공개 |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 공개 (원래 공개용 키입니다) |

3. Deploy.

### 도메인 연결 — `wedding.guwonsoft.com`

Vercel 프로젝트 → **Settings → Domains** → `wedding.guwonsoft.com` 추가.
그러면 Vercel이 아래와 같은 DNS 레코드를 알려줍니다. 도메인 관리 페이지에 그대로 추가하세요.

| 타입 | 이름(호스트) | 값 |
|---|---|---|
| CNAME | `wedding` | `cname.vercel-dns.com` |

- 루트 도메인(`guwonsoft.com`)은 건드리지 않으므로 기존 서비스와 완전히 분리됩니다.
- 반영에 보통 몇 분, 길면 수십 분 걸립니다. HTTPS 인증서는 Vercel이 자동 발급합니다.
- **정확한 CNAME 값은 Vercel 화면에 표시된 것을 쓰세요.** 계정/지역에 따라 다를 수 있습니다.

배포 후 `NEXT_PUBLIC_SITE_URL` 을 바꿨다면 **재배포**해야 공유 미리보기 주소가 반영됩니다.

---

## 7. 참석 인원 확인

`https://wedding.guwonsoft.com/admin` → `ADMIN_PASSWORD` 로 로그인.

- 응답 수, **참석 인원**, **식사 예정 인원**, 불참, 신랑측/신부측 인원을 한눈에 보여줍니다.
- 뷔페 예상 인원을 "식사 예정 N명 (+ 미정 M명 → 최대 N+M명)" 으로 계산해 줍니다.
- **CSV 내려받기** 로 엑셀에서 바로 열 수 있습니다. (UTF-8 BOM 포함)
- 검색엔진에는 노출되지 않습니다 (`noindex`).

---

## 8. 자주 하는 수정

| 하고 싶은 것 | 고칠 곳 |
|---|---|
| 문구·이름·날짜·계좌 등 모든 내용 | `src/config/wedding.ts` |
| 색·글꼴·여백 | `src/app/globals.css` 의 `@theme` |
| 섹션 순서 / 빼기 | `src/app/page.tsx` |
| 사진 장수 변경 | `wedding.gallery` 의 `length: 14` |
| 하단 바 항목 | `src/components/Dock.tsx` |
| 푸터의 제작 서명 | `src/components/Footer.tsx` 맨 아래 |
| 공유 썸네일 | `src/app/opengraph-image.tsx` (또는 `public/og.jpg` + `meta.ogImage`) |

---

## 9. 개인정보

- 수집 항목: **성함, 연락처(선택), 참석 여부, 인원, 식사 여부, 메시지**
- RSVP 폼에 수집·이용 동의 체크가 있으며, 동의 없이는 전송되지 않습니다.
- 예식이 끝나면 Supabase SQL Editor에서 아래를 실행해 파기하세요.

```sql
delete from public.rsvps;
delete from public.guestbook;
```

---

## 10. 구조

```
src/
  app/
    page.tsx                 청첩장 본문 (섹션 조립)
    layout.tsx               폰트 · 메타데이터 · 구조화 데이터
    opengraph-image.tsx      공유 썸네일 자동 생성
    admin/page.tsx           참석 인원 대시보드
    api/
      rsvp/                  참석 여부 저장
      guestbook/             방명록 목록·작성·삭제
      calendar/              .ics 다운로드
      admin/                 로그인 · CSV 내보내기
  components/                섹션별 UI
  config/wedding.ts          ★ 내용은 전부 여기
  lib/                       supabase · 날짜 · 해시 · 레이트리밋 · 관리자 세션
  hooks/useClient.ts         하이드레이션 안전 훅
supabase/schema.sql          DB 스키마 (한 번 실행)
scripts/make-placeholders.mjs 임시 사진 생성기
```
