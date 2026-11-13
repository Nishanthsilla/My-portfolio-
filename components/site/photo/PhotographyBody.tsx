import Link from "next/link";
import PhotoGallery from "./PhotoGallery";
import site from "../site.module.css";
import g from "./photo.module.css";
import { photography } from "@/lib/site/about";

/** Photography: an immersive endless gallery. Used by /photography and by the homepage folder's sheet. */
export default function PhotographyBody({ inSheet = false, photo }: { inSheet?: boolean; photo?: number }) {
  return (
    <>
      <div className={site.container}>
        <header className={g.head} style={inSheet ? { paddingTop: 8 } : undefined}>
          <div>
            <p className={site.eyebrow}>Photography · {photography.photos.length} photographs</p>
            <h1 className={g.title}>Frames, places and moments.</h1>
          </div>
          {!inSheet && (
            <Link className={g.back} href="/">
              <span aria-hidden="true">←</span> Back to the folders
            </Link>
          )}
        </header>
      </div>
      <PhotoGallery photo={photo} />
      <div className={site.container}>
        <section className={g.note} aria-label="About the photographs">
          <p className={g.noteText}>{photography.note}</p>
          <div className={g.noteLinks}>
            <a href={photography.instagram} target="_blank" rel="noopener noreferrer">
              More on Instagram <span aria-hidden="true">↗</span>
            </a>
            {!inSheet && (
              <Link href="/beyond">
                Beyond the Interface <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
