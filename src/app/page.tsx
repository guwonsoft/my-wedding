import { Cover } from "@/components/Cover";
import { Greeting } from "@/components/Greeting";
import { CalendarSection } from "@/components/CalendarSection";
import { Gallery } from "@/components/Gallery";
import { Location } from "@/components/Location";
import { Rsvp } from "@/components/Rsvp";
import { Accounts } from "@/components/Accounts";
import { Guestbook } from "@/components/Guestbook";
import { Share } from "@/components/Share";
import { Footer } from "@/components/Footer";
import { Dock } from "@/components/Dock";
import { Bgm } from "@/components/Bgm";
import { ConsoleSignature } from "@/components/ConsoleSignature";

export default function Page() {
  return (
    <main className="canvas">
      <Cover />
      <Greeting />
      <CalendarSection />
      <Gallery />
      <Location />
      <Rsvp />
      <Accounts />
      <Guestbook />
      <Share />
      <Footer />

      <Dock />
      <Bgm />
      <ConsoleSignature />
    </main>
  );
}
