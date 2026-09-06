"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "로그인에 실패했습니다.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <form onSubmit={submit} className="w-full max-w-[320px]">
        <p className="font-mono text-[10px] tracking-[0.28em] text-ink-3 uppercase">Admin</p>
        <h1 className="mt-2 font-[family-name:var(--font-ko-serif)] text-[20px] tracking-[0.06em]">
          참석 여부 집계
        </h1>

        {!configured ? (
          <p className="mt-6 border border-line bg-paper-2 p-4 text-[12px] leading-relaxed text-ink-2">
            <code className="font-mono text-[11px] text-accent-2">ADMIN_PASSWORD</code> 환경변수가
            설정되어 있지 않습니다. <br />
            Vercel 프로젝트 설정 또는 <code className="font-mono text-[11px]">.env.local</code>에
            비밀번호를 추가한 뒤 다시 시도해 주세요.
          </p>
        ) : (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              className="mt-7 w-full border-b border-line bg-transparent py-2.5 placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
            />
            {error && (
              <p role="alert" className="mt-3 text-[12px] text-[#b06060]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="mt-6 w-full bg-ink py-3.5 font-mono text-[11px] tracking-[0.24em] text-paper uppercase disabled:opacity-50"
            >
              {sending ? "…" : "Enter"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
