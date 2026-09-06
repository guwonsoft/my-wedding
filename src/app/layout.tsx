import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gowun_Batang, JetBrains_Mono } from "next/font/google";
import { wedding } from "@/config/wedding";
import { formatKoreanDateTime } from "@/lib/date";
import { RevealProvider } from "@/components/RevealProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

// 한글 명조 — 구글 폰트에 한국어 subset 프리로드가 없어 preload는 끕니다.
const gowun = Gowun_Batang({
  variable: "--font-gowun",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || wedding.meta.url;

// ogImage를 비워두면 app/opengraph-image.tsx 가 그린 이미지를 Next가 자동으로 붙입니다.
const ogImages = wedding.meta.ogImage
  ? [{ url: wedding.meta.ogImage, width: 1200, height: 630, alt: wedding.meta.title }]
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: wedding.meta.title,
  description: wedding.meta.description,
  applicationName: wedding.meta.title,
  keywords: ["모바일청첩장", "결혼식", wedding.groom.name, wedding.bride.name, wedding.venue.name],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: wedding.meta.title,
    title: wedding.meta.title,
    description: wedding.meta.description,
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: wedding.meta.title,
    description: wedding.meta.description,
    images: ogImages?.map((i) => i.url),
  },
  // 계좌번호·가족 연락처·하객 방명록이 있는 페이지입니다.
  // 청첩장은 링크를 받은 사람만 보면 되므로 검색엔진 색인을 막습니다.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f6f3ee",
};

/** 검색엔진/메신저가 읽는 구조화 데이터 */
function EventJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: wedding.meta.title,
    startDate: wedding.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    description: `${formatKoreanDateTime(wedding.date)} · ${wedding.venue.name}`,
    location: {
      "@type": "Place",
      name: `${wedding.venue.name} ${wedding.venue.hall}`,
      address: { "@type": "PostalAddress", streetAddress: wedding.venue.address, addressCountry: "KR" },
      geo: { "@type": "GeoCoordinates", latitude: wedding.venue.lat, longitude: wedding.venue.lng },
    },
    organizer: { "@type": "Person", name: `${wedding.groom.name} · ${wedding.bride.name}` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${cormorant.variable} ${gowun.variable} ${mono.variable}`}
    >
      <body>
        <EventJsonLd />
        <RevealProvider />
        {children}
      </body>
    </html>
  );
}
