import { ImageResponse } from "next/og";
import { wedding } from "@/config/wedding";
import { kst } from "@/lib/date";

export const alt = wedding.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * 카톡·문자로 링크를 보낼 때 뜨는 미리보기 이미지를 코드로 그립니다.
 *
 * 사진을 쓰고 싶으면 public/og.jpg 를 넣고
 * config/wedding.ts 의 meta.ogImage 에 "/og.jpg" 를 적으면 그쪽이 우선합니다.
 *
 * 한글 폰트를 이 런타임에 심으려면 별도 폰트 파일이 필요하므로,
 * 여기서는 라틴 표기와 숫자만 사용합니다.
 */
export default async function OgImage() {
  const t = kst(wedding.date);
  const p = (n: number) => String(n).padStart(2, "0");
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][t.weekday];
  const meridiem = t.hour < 12 ? "AM" : "PM";
  const h12 = t.hour % 12 === 0 ? 12 : t.hour % 12;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f3ee",
          color: "#23201c",
          position: "relative",
        }}
      >
        {/* 얇은 테두리 */}
        <div
          style={{
            // Satori는 inset 단축 속성을 해석하지 못해 개별 값으로 적습니다.
            position: "absolute",
            top: 34,
            right: 34,
            bottom: 34,
            left: 34,
            border: "1px solid #ddd6cb",
          }}
        />

        <div style={{ display: "flex", fontSize: 22, letterSpacing: 14, color: "#9a9289" }}>
          THE WEDDING OF
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 44,
            fontSize: 92,
            letterSpacing: 1,
          }}
        >
          <span>{wedding.groom.en}</span>
          <span style={{ margin: "0 30px", fontSize: 62, color: "#a98f63" }}>&</span>
          <span>{wedding.bride.en}</span>
        </div>

        <div style={{ display: "flex", width: 90, height: 1, background: "#ddd6cb", marginTop: 50 }} />

        <div style={{ display: "flex", marginTop: 46, fontSize: 30, letterSpacing: 8, color: "#5a544c" }}>
          {t.year}. {p(t.month)}. {p(t.day)} {weekday} {meridiem} {h12}:{p(t.minute)}
        </div>
      </div>
    ),
    size,
  );
}
