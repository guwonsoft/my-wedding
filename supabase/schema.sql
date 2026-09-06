-- ─────────────────────────────────────────────────────────────
--  모바일 청첩장 — Supabase 스키마
--
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 Run 하세요.
--  (한 번만 실행하면 됩니다)
-- ─────────────────────────────────────────────────────────────

-- 참석 여부 응답
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  side        text        not null check (side in ('groom', 'bride')),
  name        text        not null check (char_length(name) between 1 and 20),
  phone       text,
  attending   boolean     not null,
  party_size  smallint    not null default 1 check (party_size between 0 and 10),
  meal        text        not null default 'undecided' check (meal in ('yes', 'no', 'undecided')),
  message     text        check (char_length(message) <= 200)
);

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

-- 방명록
create table if not exists public.guestbook (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text        not null check (char_length(name) between 1 and 20),
  message       text        not null check (char_length(message) between 1 and 300),
  password_hash text        not null,
  hidden        boolean     not null default false
);

create index if not exists guestbook_created_at_idx on public.guestbook (created_at desc)
  where hidden = false;

-- ─────────────────────────────────────────────────────────────
--  보안: RLS는 켜두고 정책은 만들지 않습니다.
--
--  이 앱은 브라우저에서 DB에 직접 붙지 않고, 항상 Next.js 서버(Route Handler)가
--  service_role 키로 접근합니다. service_role은 RLS를 우회하므로 앱은 정상 동작하고,
--  혹시 anon 키가 노출되더라도 외부에서는 아무것도 읽거나 쓸 수 없습니다.
-- ─────────────────────────────────────────────────────────────
alter table public.rsvps     enable row level security;
alter table public.guestbook enable row level security;

-- 예식 후 개인정보 파기용 (필요할 때 수동 실행)
-- delete from public.rsvps where created_at < now() - interval '30 days';
