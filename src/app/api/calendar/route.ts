import { wedding } from "@/config/wedding";

const DURATION_HOURS = 2;

/** RFC 5545 — 줄바꿈은 \r\n, 텍스트의 콤마/세미콜론은 이스케이프 */
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET() {
  const start = new Date(wedding.date);
  const end = new Date(start.getTime() + DURATION_HOURS * 3600_000);
  const title = `${wedding.groom.name} ♥ ${wedding.bride.name} 결혼식`;
  const location = `${wedding.venue.name} ${wedding.venue.hall} (${wedding.venue.address})`;
  const url = process.env.NEXT_PUBLIC_SITE_URL || wedding.meta.url;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//guwonsoft//wedding-invitation//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:wedding-${stamp(start)}@guwonsoft.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(`${wedding.meta.description}\n${url}`)}`,
    `URL:${url}`,
    `GEO:${wedding.venue.lat};${wedding.venue.lng}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`내일은 ${title}입니다`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="wedding.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
