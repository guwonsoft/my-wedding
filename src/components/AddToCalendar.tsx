"use client";

import { useState } from "react";
import { wedding } from "@/config/wedding";
import { Sheet, GhostButton } from "./Sheet";

const DURATION_HOURS = 2;

function utcStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function AddToCalendar() {
  const [open, setOpen] = useState(false);

  const start = new Date(wedding.date);
  const end = new Date(start.getTime() + DURATION_HOURS * 3600_000);
  const title = `${wedding.groom.name} ♥ ${wedding.bride.name} 결혼식`;
  const location = `${wedding.venue.name} ${wedding.venue.hall} (${wedding.venue.address})`;

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${utcStamp(start)}/${utcStamp(end)}` +
    `&location=${encodeURIComponent(location)}` +
    `&details=${encodeURIComponent(wedding.meta.description)}`;

  return (
    <>
      <GhostButton onClick={() => setOpen(true)}>
        <CalIcon />
        캘린더에 저장
      </GhostButton>

      <Sheet open={open} onClose={() => setOpen(false)} title="save the date">
        <ul className="divide-y divide-line/70 border-y border-line/70 pb-2">
          <li>
            <a
              href="/api/calendar"
              className="flex items-center gap-3 py-4 text-[14px] transition-colors active:text-accent"
            >
              <AppleIcon />
              <span className="flex-1">기본 캘린더에 추가</span>
              <span className="font-mono text-[10px] text-ink-3">.ics</span>
            </a>
          </li>
          <li>
            <a
              href={googleUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 py-4 text-[14px] transition-colors active:text-accent"
            >
              <GoogleIcon />
              <span className="flex-1">구글 캘린더에 추가</span>
              <ArrowIcon />
            </a>
          </li>
        </ul>
        <p className="pt-4 pb-1 text-[11.5px] leading-relaxed text-ink-3">
          예식 시간 기준 {DURATION_HOURS}시간 일정으로 저장됩니다.
        </p>
      </Sheet>
    </>
  );
}

function CalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3.2" width="12" height="10.8" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 6.4h12M5.4 1.8v2.6M10.6 1.8v2.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-ink-2">
      <rect x="2" y="3.2" width="12" height="10.8" rx="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 6.4h12" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="10" r="1.3" fill="currentColor" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-ink-2">
      <rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6 6.6h4M6 9.4h2.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="text-ink-3">
      <path d="M3.5 8.5 8.5 3.5M4.6 3.5h3.9v3.9" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}
