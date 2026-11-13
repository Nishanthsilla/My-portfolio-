import SiteShell from "@/components/site/SiteShell";
import Footer from "@/components/site/Footer";
import EasterSticker from "@/components/site/EasterSticker";
import Journey from "@/components/site/home/Journey";
import StoryPanels from "@/components/site/home/StoryPanels";
import Bento from "@/components/site/home/Bento";
import FolderShelf from "@/components/site/home/FolderShelf";
import WallScene from "@/components/wall/WallScene";
import BeyondJournal from "@/components/site/beyond/BeyondJournal";
import PhotographyBody from "@/components/site/photo/PhotographyBody";
import s from "@/components/site/site.module.css";

/**
 * Homepage (the intro film plays above it on load): one horizontal journey —
 * 1 intro → 2 work → 3 the two folders → 4 The Wall → 5 contact. A folder opens
 * its content in a sheet below the journey.
 */
export default function HomePage() {
  return (
    <SiteShell footer={false}>
      <Journey
        intro={<StoryPanels />}
        work={<Bento variant="journey" />}
        folders={<FolderShelf />}
        wall={<WallScene />}
        contact={
          <>
            <Footer />
            <div className={s.container} style={{ position: "relative", marginTop: -84 }}>
              <EasterSticker />
            </div>
          </>
        }
        beyond={<BeyondJournal inSheet />}
        photography={<PhotographyBody inSheet />}
      />
    </SiteShell>
  );
}
