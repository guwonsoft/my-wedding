"use client";

import { useId, useState } from "react";
import { wedding } from "@/config/wedding";
import { formatStamp } from "@/lib/date";
import { useClientValue } from "@/hooks/useClient";
import { Section, SectionLabel } from "./ui";

const STORAGE_KEY = "wedding:rsvp-submitted";

type Side = "groom" | "bride";
type Meal = "yes" | "no" | "undecided";

type FormState = {
  attending: boolean;
  side: Side;
  name: string;
  phone: string;
  partySize: number;
  meal: Meal;
  agree: boolean;
  /** 봇 유인용 — 사람은 절대 채우지 않는 칸 */
  website: string;
};

function readSubmitted(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    // 시크릿 모드 등에서 접근이 막힐 수 있습니다.
    return false;
  }
}

const INITIAL: FormState = {
  attending: true,
  side: "groom",
  name: "",
  phone: "",
  partySize: 1,
  meal: "yes",
  agree: false,
  website: "",
};

export function Rsvp() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const deadline = wedding.rsvp.deadline || wedding.date;
  const deadlineMs = new Date(deadline).getTime();

  // 현재 시각과 localStorage는 서버에서 알 수 없는 값입니다.
  // 서버/첫 렌더는 보수적으로 "마감 아님 / 응답 없음"으로 두고,
  // 하이드레이션 이후 실제 값으로 교체됩니다.
  const closed = useClientValue(() => Date.now() > deadlineMs, false);
  const alreadySent = useClientValue(readSubmitted, false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("성함을 입력해 주세요.");
    if (form.name.trim().length > 20) return setError("성함이 너무 깁니다.");
    if (!form.agree) return setError("개인정보 수집·이용에 동의해 주세요.");

    setStatus("sending");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          phone: form.phone.trim(),
          partySize: form.attending ? form.partySize : 0,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "전송에 실패했습니다.");

      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {
        /* 무시 */
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "전송에 실패했습니다.");
    }
  }

  return (
    <Section id="rsvp" tone="deep">
      <div className="flex flex-col items-center text-center">
        <SectionLabel index={5} en="R.S.V.P" ko={wedding.rsvp.title} />
        <p
          className="mt-7 text-[13.5px] leading-[2] whitespace-pre-line text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "100ms" }}
        >
          {wedding.rsvp.description}
        </p>
        <p
          className="mt-5 font-mono text-[10px] tracking-[0.16em] text-ink-3 tnum"
          data-reveal
          style={{ ["--reveal-delay" as string]: "160ms" }}
        >
          DUE · {formatStamp(deadline)}
        </p>
      </div>

      <div
        className="mt-9 border border-line bg-paper p-6"
        data-reveal="scale"
        style={{ ["--reveal-delay" as string]: "120ms" }}
      >
        {closed ? (
          <Notice
            title="응답이 마감되었습니다"
            body="참석 여부 전달 기간이 종료되었습니다. 문의는 신랑·신부에게 연락 부탁드립니다."
          />
        ) : status === "done" ? (
          <Notice
            title="전달되었습니다"
            body={
              form.attending
                ? "귀한 걸음 해주시는 만큼 정성껏 준비하겠습니다. 예식장에서 뵙겠습니다."
                : "마음 전해주셔서 감사합니다. 축복해 주신 마음 오래 간직하겠습니다."
            }
            tone="accent"
          />
        ) : (
          <>
            {alreadySent && (
              <p className="mb-5 border-l-2 border-accent bg-paper-2 px-3 py-2.5 text-[12px] leading-relaxed text-ink-2">
                이미 응답을 보내주셨습니다. 다시 작성하시면 최신 내용으로 반영됩니다.
              </p>
            )}

            <form onSubmit={submit} noValidate className="space-y-6">
              {/* 참석 여부 */}
              <Field label="참석 여부" required>
                <Segmented
                  value={form.attending ? "yes" : "no"}
                  onChange={(v) => set("attending", v === "yes")}
                  options={[
                    { value: "yes", label: "참석합니다" },
                    { value: "no", label: "어렵습니다" },
                  ]}
                />
              </Field>

              {/* 구분 */}
              <Field label="어느 분의 하객이신가요" required>
                <Segmented
                  value={form.side}
                  onChange={(v) => set("side", v as Side)}
                  options={[
                    { value: "groom", label: `신랑 ${wedding.groom.given}` },
                    { value: "bride", label: `신부 ${wedding.bride.given}` },
                  ]}
                />
              </Field>

              {/* 성함 */}
              <Field label="성함" required htmlFor="rsvp-name">
                <input
                  id="rsvp-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="홍길동"
                  maxLength={20}
                  autoComplete="name"
                  className="w-full border-b border-line bg-transparent py-2.5 placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
                />
              </Field>

              {/* 연락처 */}
              <Field label="연락처" hint="선택 · 변동 사항 안내에만 사용합니다" htmlFor="rsvp-phone">
                <input
                  id="rsvp-phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/[^\d-]/g, ""))}
                  placeholder="010-0000-0000"
                  maxLength={13}
                  autoComplete="tel"
                  className="w-full border-b border-line bg-transparent py-2.5 placeholder:text-ink-3/60 focus:border-accent focus:outline-none"
                />
              </Field>

              {/* 참석일 때만 — 인원 / 식사 */}
              <div
                className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  form.attending ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-6 pt-0.5">
                    <Field label="총 인원" hint="본인 포함, 함께 오시는 모든 분">
                      <Stepper
                        value={form.partySize}
                        min={1}
                        max={10}
                        onChange={(v) => set("partySize", v)}
                      />
                    </Field>

                    <Field label="식사 여부" hint="뷔페 인원 준비에 참고합니다">
                      <Segmented
                        value={form.meal}
                        onChange={(v) => set("meal", v as Meal)}
                        options={[
                          { value: "yes", label: "예정" },
                          { value: "no", label: "안 함" },
                          { value: "undecided", label: "미정" },
                        ]}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* 허니팟 */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </div>

              {/* 동의 */}
              <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#a98f63]"
                />
                <span className="text-[11.5px] leading-relaxed text-ink-2">
                  참석 여부 확인 및 예식 준비를 위한 개인정보(성함·연락처) 수집·이용에 동의합니다.
                  <br />
                  <span className="text-ink-3">수집한 정보는 예식 후 30일 이내 파기됩니다.</span>
                </span>
              </label>

              {error && (
                <p role="alert" className="text-[12px] text-[#b06060]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-ink py-4 font-mono text-[11px] tracking-[0.24em] text-paper uppercase transition-all duration-300 hover:bg-accent-2 disabled:opacity-50"
              >
                {status === "sending" ? "SENDING…" : "전달하기"}
              </button>
            </form>
          </>
        )}
      </div>
    </Section>
  );
}

/* ── 작은 조각들 ─────────────────────────────────────────── */

function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  /** 실제 폼 컨트롤의 id — 주면 <label>로 연결되고, 없으면 role="group"으로 묶습니다. */
  htmlFor?: string;
  children: React.ReactNode;
}) {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const hintId = hint ? `${autoId}-hint` : undefined;

  const head = (
    <>
      {label}
      {required && (
        <>
          <span aria-hidden className="ml-1 text-accent">
            *
          </span>
          <span className="sr-only"> (필수)</span>
        </>
      )}
    </>
  );

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="font-mono text-[10px] tracking-[0.18em] text-ink-2 uppercase"
          >
            {head}
          </label>
        ) : (
          <span
            id={labelId}
            className="font-mono text-[10px] tracking-[0.18em] text-ink-2 uppercase"
          >
            {head}
          </span>
        )}
        {hint && (
          <span id={hintId} className="text-[10.5px] text-ink-3">
            {hint}
          </span>
        )}
      </div>
      {htmlFor ? (
        children
      ) : (
        <div role="group" aria-labelledby={labelId} aria-describedby={hintId}>
          {children}
        </div>
      )}
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div className="relative grid gap-0 border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {/* 미끄러지는 표시자 */}
      <span
        className="absolute inset-y-0 bg-ink transition-transform duration-[420ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]"
        style={{
          width: `${100 / options.length}%`,
          transform: `translateX(${index * 100}%)`,
        }}
        aria-hidden
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`relative z-10 py-3 text-[13px] transition-colors duration-300 ${
            value === o.value ? "text-paper" : "text-ink-2"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "grid h-11 w-11 place-items-center border border-line text-ink-2 transition-colors active:bg-paper-2 disabled:opacity-30";
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="인원 줄이기"
        className={btn}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>

      <span className="min-w-[54px] text-center font-[family-name:var(--font-cormorant)] text-[26px] leading-none font-light tnum">
        {value}
        <span className="ml-1 font-sans text-[12px] text-ink-3">명</span>
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="인원 늘리기"
        className={btn}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}

function Notice({
  title,
  body,
  tone = "plain",
}: {
  title: string;
  body: string;
  tone?: "plain" | "accent";
}) {
  return (
    <div className="py-6 text-center">
      <div
        className={`mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full border ${
          tone === "accent" ? "border-accent text-accent" : "border-line text-ink-3"
        }`}
      >
        {tone === "accent" ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="m3 8.4 3.4 3.4L13 4.6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 4.6v4M8 10.8v.6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        )}
      </div>
      <p className="font-[family-name:var(--font-ko-serif)] text-[15px] text-ink">{title}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
