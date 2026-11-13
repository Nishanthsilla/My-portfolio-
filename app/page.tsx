import SiteShell from "@/components/site/SiteShell";
import EasterSticker from "@/components/site/EasterSticker";
import HorizontalIntro from "@/components/site/home/HorizontalIntro";
import Bento from "@/components/site/home/Bento";
import FolderShelf from "@/components/site/home/FolderShelf";
import HomeReturn from "@/components/site/home/HomeReturn";
import WallTeaser from "@/components/wall/WallTeaser";
import s from "@/components/site/site.module.css";

/**
 * Homepage (the intro film plays above it on load):
 * a pinned horizontal story → the work as a bento → two folders
 * (Beyond the Interface, Photography) → the sticker Easter egg → The Wall → footer.
 */
export default function HomePage() {
  return (
    <SiteShell>
      <HomeReturn />
      <HorizontalIntro />
      <Bento />
      <FolderShelf />
      <div className={s.container}>
        <EasterSticker />
      </div>
      <WallTeaser />
    </SiteShell>
  );
}
