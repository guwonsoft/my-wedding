import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트.
 *
 * service_role 키를 쓰기 때문에 절대 클라이언트 번들에 들어가면 안 됩니다.
 * (`server-only` import가 실수로 컴포넌트에서 부르면 빌드를 깨뜨려 줍니다.)
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** 환경변수가 없을 때 API가 내려줄 공통 응답 */
export const NOT_CONFIGURED = {
  ok: false as const,
  error:
    "데이터베이스가 아직 연결되지 않았습니다. .env.local 의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 를 확인해 주세요.",
};
