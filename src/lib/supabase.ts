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

/**
 * 환경변수가 없을 때 API가 내려줄 공통 응답.
 *
 * 이 문구는 하객 화면에 그대로 뜹니다. `.env.local` 같은 개발자용 안내를 노출하면
 * 청첩장을 받은 분들이 당황하므로, 사람이 읽기 좋은 말로만 적습니다.
 * 원인은 서버 로그로만 남깁니다.
 */
export const NOT_CONFIGURED = {
  ok: false as const,
  error: "지금은 접수가 어렵습니다. 잠시 후 다시 시도해 주시거나, 신랑·신부에게 직접 알려주세요.",
};

if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다. 참석 여부·방명록이 저장되지 않습니다.",
  );
}
