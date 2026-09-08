import { wedding } from "@/config/wedding";
import { Section, SectionLabel } from "./ui";
import { KakaoMap } from "./KakaoMap";
import { CopyButton } from "./CopyButton";

const { venue } = wedding;
const q = encodeURIComponent(venue.name);

/**
 * 지도 앱 바로가기 — config에 직접 URL을 넣으면 그 값이 우선.
 *
 * T맵만 https 주소가 아니라 앱 실행 스킴(tmap://)입니다.
 * SK의 REST 주소(apis.openapi.sk.com/.../routes)는 appKey가 있어야 하고,
 * 키 없이 부르면 하객에게 401 JSON 에러 화면이 그대로 보입니다.
 * 스킴 방식은 키가 필요 없고 iOS·안드로이드 모두에서 앱이 바로 열립니다.
 */
const NAV_LINKS = [
  {
    name: "카카오맵",
    href: venue.kakaoMapUrl || `https://map.kakao.com/link/to/${q},${venue.lat},${venue.lng}`,
    /** http(s) 링크만 새 탭으로 — 커스텀 스킴에 target을 주면 빈 탭만 남습니다. */
    web: true,
  },
  {
    name: "네이버지도",
    href: venue.naverMapUrl || `https://map.naver.com/p/search/${q}`,
    web: true,
  },
  {
    name: "T map",
    href: venue.tmapUrl || `tmap://route?goalname=${q}&goalx=${venue.lng}&goaly=${venue.lat}`,
    web: false,
  },
];

export function Location() {
  const fullAddress = `${venue.address} ${venue.addressDetail}`.trim();

  return (
    <Section id="location">
      <div className="flex flex-col items-center">
        <SectionLabel index={4} en="Location" ko="오시는 길" />

        <p
          className="mt-8 font-[family-name:var(--font-ko-serif)] text-[17px] tracking-[0.06em] text-ink"
          data-reveal
        >
          {venue.name}
        </p>
        <p
          className="mt-1.5 text-[13px] text-ink-2"
          data-reveal
          style={{ ["--reveal-delay" as string]: "80ms" }}
        >
          {venue.hall}
        </p>
        <a
          href={`tel:${venue.tel.replace(/-/g, "")}`}
          className="mt-1 font-mono text-[11px] tracking-[0.1em] text-ink-3 underline-offset-4 hover:underline"
          data-reveal
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          {venue.tel}
        </a>
      </div>

      {/* 지도 */}
      <div
        className="mt-7 overflow-hidden border border-line"
        data-reveal="scale"
        style={{ ["--reveal-delay" as string]: "100ms" }}
      >
        <KakaoMap />
      </div>

      {/* 주소 + 복사 */}
      <div
        className="mt-3 flex items-center gap-3 border-b border-line pb-3"
        data-reveal
        style={{ ["--reveal-delay" as string]: "60ms" }}
      >
        <p className="flex-1 text-[12.5px] leading-relaxed text-ink-2">{fullAddress}</p>
        <CopyButton value={fullAddress} label="주소복사" />
      </div>

      {/* 지도 앱 */}
      <div
        className="mt-4 grid grid-cols-3 gap-1.5"
        data-reveal
        style={{ ["--reveal-delay" as string]: "100ms" }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.href}
            {...(link.web ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            className="flex items-center justify-center gap-1.5 border border-line py-3 text-[12px] text-ink-2 transition-colors active:bg-paper-2"
          >
            {link.name}
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden className="text-ink-3">
              <path d="M3.5 8.5 8.5 3.5M4.6 3.5h3.9v3.9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
        ))}
      </div>

      {/* 교통 안내 */}
      <dl className="mt-10 space-y-6">
        {wedding.transport.map((t, i) => (
          <div
            key={t.label}
            className="grid grid-cols-[62px_1fr] gap-3"
            data-reveal="left"
            style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
          >
            <dt className="pt-0.5">
              <span className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">
                {t.label}
              </span>
            </dt>
            <dd className="space-y-1.5">
              {t.lines.map((line) => (
                <p key={line} className="text-[12.5px] leading-relaxed text-ink-2">
                  {line}
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
