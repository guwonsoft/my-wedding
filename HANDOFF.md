# 맥미니에서 이어서 하기

이 파일은 이사용 안내입니다. 세팅이 끝나면 지우셔도 됩니다.

## 1. 압축 풀고 실행

```bash
cd wedding-invitation
npm install
npm run dev
```

http://localhost:3000

`npm install` 이 `EACCES ... /Users/<이름>/.npm/_cacache` 로 실패하면
(맥북에서 겪었던 문제입니다. 맥미니는 아마 괜찮습니다):

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

## 2. 사진 넣기

`public/gallery/` 에 `01.jpg` ~ `14.jpg`.
아직 없다면 레이아웃 미리보기용 임시 사진을 만들 수 있습니다.

```bash
npm run placeholders
```

> 압축 파일에는 임시 사진이 들어있지 않습니다 (언제든 위 명령으로 다시 만들 수 있어서 뺐습니다).

## 3. 남은 TODO

`src/config/wedding.ts` 에서 `// TODO` 를 검색하세요.

- 예식장 **주소와 좌표** — 지금 값은 확인되지 않은 임시값입니다 (카카오맵에서 "부전교회" 검색)
- 예식 문의 전화번호
- 신랑·신부·혼주 연락처 6개
- 계좌번호 6개
- 교통 안내 (`transport`)
- 신부 영문 표기 (`Geonyoung` → 원하시는 철자)

## 4. 아직 안 한 것

- **Supabase 프로젝트 생성** — 안 하면 참석 여부·방명록이 저장되지 않습니다.
  `README.md` 4번 참고. `supabase/schema.sql` 을 SQL Editor에 붙여넣고 Run.
- **카카오 JS 키** (선택) — 지도와 카톡 공유용. `README.md` 5번.
- **Vercel 배포 + 도메인 연결** — `README.md` 6번.
  `wedding.guwonsoft.com` → CNAME → `cname.vercel-dns.com`

## 5. .env.local

같이 들어있습니다. 아직 값이 비어 있고, `ADMIN_PASSWORD` 만
로컬 확인용(`local-dev-1234`)으로 넣어둔 상태입니다.
**배포할 때는 Vercel 환경변수에 훨씬 긴 비밀번호를 따로 넣으세요.**

## 6. git

커밋 이력이 그대로 들어있습니다.

```bash
git log --oneline
```

나중에 GitHub에 올릴 때 (Vercel 배포에 필요):

```bash
gh repo create wedding-invitation --private --source=. --push
```
