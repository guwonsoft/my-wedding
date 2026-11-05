import { Cover } from "@/components/Cover";
import { Greeting } from "@/components/Greeting";
import { CalendarSection } from "@/components/CalendarSection";
import { Gallery } from "@/components/Gallery";
import { Location } from "@/components/Location";
import { Rsvp } from "@/components/Rsvp";
import { Accounts } from "@/components/Accounts";
import { Share } from "@/components/Share";
import { Footer } from "@/components/Footer";
import { Dock } from "@/components/Dock";
import { Bgm } from "@/components/Bgm";
import { NoticeModal } from "@/components/NoticeModal";
import { ConsoleSignature } from "@/components/ConsoleSignature";

/**
 * 카운트다운·D-day의 첫 화면 값이 "빌드한 순간"에 박히지 않도록 1시간마다 다시 만듭니다.
 * (하이드레이션 후에는 어차피 1초마다 갱신되지만, 그 전 첫 페인트가 틀리면 눈에 띕니다.)
 */
export const revalidate = 3600;

export default function Page() {
  return (
    <main className="canvas">
      <Cover />
      <Greeting />
      <CalendarSection />
      {/* 어르신들이 계좌를 찾기 쉽도록 예식 안내 바로 아래에 둡니다 (예전엔 참석 여부 다음) */}
      <Accounts />
      <Gallery />
      <Location />
      <Rsvp />
      <Share />
      <Footer />

      <Dock />
      <Bgm />
      <NoticeModal />
      <ConsoleSignature />
    </main>
  );
}

