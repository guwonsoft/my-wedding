"use client";

import { useCallback, useEffect, useState } from "react";
import { Section, SectionLabel } from "./ui";
import { Sheet, GhostButton } from "./Sheet";

type Entry = { id: string; name: string; message: string; created_at: string };

const PAGE = 10;

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [writeOpen, setWriteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Entry | null>(null);

  const load = useCallback(async (offset: number) => {
    try {
      const res = await fetch(`/api/guestbook?offset=${offset}`, { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        entries?: Entry[];
        total?: number;
        hasMore?: boolean;
        error?: string;
      };
      if (!data.ok) {
        setNotice(data.error ?? "방명록을 불러오지 못했습니다.");
        return;
      }
      setNotice("");
      setEntries((prev) => (offset === 0 ? (data.entries ?? []) : [...prev, ...(data.entries ?? [])]));
      setTotal(data.total ?? 0);
      setHasMore(Boolean(data.hasMore));
    } catch {
      setNotice("방명록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 첫 진입 시 목록을 한 번 불러옵니다.
    // load()는 await 이후에만 상태를 바꾸므로 연쇄 렌더가 아니지만,
    // 린트 규칙은 async 경계를 구분하지 못해 여기서만 예외로 둡니다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(0);
  }, [load]);

  return (
    <Section id="guestbook" tone="deep">
      <div className="flex flex-col items-center text-center">
        <SectionLabel index={7} en="Guestbook" ko="축하 한마디" />
        <p
          className="mt-7 text-[13px] leading-[2] text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "100ms" }}
        >
          따뜻한 축하의 말씀을 남겨주세요.
          <br />
          <span className="text-ink-3">평생 간직하겠습니다.</span>
        </p>

        <div className="mt-7" data-reveal style={{ ["--reveal-delay" as string]: "160ms" }}>
          <GhostButton onClick={() => setWriteOpen(true)}>
            <PenIcon />
            축하 메시지 남기기
          </GhostButton>
        </div>
      </div>

      {/* 목록 */}
      <div className="mt-9">
        {loading ? (
          <ul className="space-y-2" aria-busy>
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-[86px] animate-pulse border border-line/60 bg-paper/60" />
            ))}
          </ul>
        ) : notice ? (
          <p className="border border-line bg-paper px-5 py-8 text-center text-[12.5px] leading-relaxed text-ink-3">
            {notice}
          </p>
        ) : entries.length === 0 ? (
          <p className="border border-line bg-paper px-5 py-10 text-center text-[12.5px] leading-relaxed text-ink-3">
            첫 번째 축하 메시지를 남겨주세요.
          </p>
        ) : (
          <>
            <p className="mb-3 text-right font-mono text-[10px] tracking-[0.14em] text-ink-3 tnum">
              TOTAL {String(total).padStart(2, "0")}
            </p>
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id} className="border border-line bg-paper px-5 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-ko-serif)] text-[14px] tracking-[0.04em] text-ink">
                      {entry.name}
                    </span>
                    <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-3 tnum">
                      {formatDate(entry.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeleting(entry)}
                      aria-label={`${entry.name}님의 메시지 삭제`}
                      className="ml-auto -mr-1 grid h-6 w-6 place-items-center text-ink-3 transition-colors hover:text-ink"
                    >
                      <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden>
                        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.85] whitespace-pre-line text-ink-2">
                    {entry.message}
                  </p>
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                type="button"
                onClick={() => void load(entries.length)}
                className="mt-3 w-full border border-line py-3.5 font-mono text-[10px] tracking-[0.2em] text-ink-2 uppercase transition-colors active:bg-paper"
              >
                더 보기 · {Math.min(PAGE, total - entries.length)}
              </button>
            )}
          </>
        )}
      </div>

      <WriteSheet
        open={writeOpen}
        onClose={() => setWriteOpen(false)}
        onCreated={(entry) => {
          setEntries((prev) => [entry, ...prev]);
          setTotal((t) => t + 1);
        }}
      />

      <DeleteSheet
        key={deleting?.id ?? "none"}
        entry={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={(id) => {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setTotal((t) => Math.max(0, t - 1));
        }}
      />
    </Section>
  );
}

/* ── 작성 ────────────────────────────────────────────────── */

function WriteSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (entry: Entry) => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("성함을 입력해 주세요.");
    if (!message.trim()) return setError("메시지를 입력해 주세요.");
    if (!/^\d{4}$/.test(password)) return setError("비밀번호는 숫자 4자리로 입력해 주세요.");

    setSending(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), password, website }),
      });
      const data = (await res.json()) as { ok: boolean; entry?: Entry; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "등록에 실패했습니다.");
      if (data.entry) onCreated(data.entry);
      setName("");
      setMessage("");
      setPassword("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="write">
      <form onSubmit={submit} noValidate className="space-y-5 pb-2">
        <Row label="성함">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="홍길동"
            className="w-full border-b border-line bg-transparent py-2.5 placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
          />
        </Row>

        <Row label="메시지" hint={`${message.length}/300`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={300}
            placeholder="축하의 마음을 담아 남겨주세요."
            className="w-full resize-none border-b border-line bg-transparent py-2.5 leading-relaxed placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
          />
        </Row>

        <Row label="비밀번호" hint="삭제할 때 필요합니다 · 숫자 4자리">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0000"
            className="w-full border-b border-line bg-transparent py-2.5 font-mono tracking-[0.3em] placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
          />
        </Row>

        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-[12px] text-[#b06060]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full bg-ink py-4 font-mono text-[11px] tracking-[0.24em] text-paper uppercase transition-colors hover:bg-accent-2 disabled:opacity-50"
        >
          {sending ? "SENDING…" : "등록하기"}
        </button>
      </form>
    </Sheet>
  );
}

/* ── 삭제 ────────────────────────────────────────────────── */

function DeleteSheet({
  entry,
  onClose,
  onDeleted,
}: {
  entry: Entry | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  // 부모가 key={entry.id}로 렌더하므로 다른 글을 고르면 이 컴포넌트가 새로 마운트됩니다.
  // → 입력값 초기화를 effect로 흉내 낼 필요가 없습니다.
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!entry) return;
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/guestbook/${entry.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "삭제에 실패했습니다.");
      onDeleted(entry.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet open={Boolean(entry)} onClose={onClose} title="delete">
      <form onSubmit={submit} noValidate className="space-y-5 pb-2">
        <p className="text-[13px] leading-relaxed text-ink-2">
          작성하실 때 입력한 비밀번호를 입력해 주세요.
        </p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0000"
          className="w-full border-b border-line bg-transparent py-2.5 text-center font-mono text-[18px] tracking-[0.5em] placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
        />
        {error && (
          <p role="alert" className="text-[12px] text-[#b06060]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full border border-ink py-3.5 font-mono text-[11px] tracking-[0.24em] text-ink uppercase transition-colors active:bg-paper-2 disabled:opacity-50"
        >
          {sending ? "…" : "삭제하기"}
        </button>
      </form>
    </Sheet>
  );
}

/* ── 조각 ────────────────────────────────────────────────── */

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-2 uppercase">{label}</span>
        {hint && <span className="font-mono text-[10px] text-ink-3 tnum">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

function PenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M11.2 2.4 13.6 4.8 5.6 12.8 2.4 13.6l.8-3.2 8-8Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
