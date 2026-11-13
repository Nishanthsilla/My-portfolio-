import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import PhotoGallery from "@/components/site/photo/PhotoGallery";
import site from "@/components/site/site.module.css";
import g from "@/components/site/photo/photo.module.css";
import { photography } from "@/lib/site/about";

export const metadata: Metadata = {
  title: "Photography — Nishanth Silla",
  description: "Frames, places and moments — photographs by Nishanth Silla.",
};

/** Photography: an immersive endless gallery (the second homepage folder). */
export default function PhotographyPage() {
  return (
    <SiteShell>
      <div className={site.container}>
        <header className={g.head}>
          <div>
            <p className={site.eyebrow}>Photography · {photography.photos.length} photographs</p>
            <h1 className={g.title}>Frames, places and moments.</h1>
          </div>
          <Link className={g.back} href="/">
            <span aria-hidden="true">←</span> Back to the folders
          </Link>
        </header>
      </div>
      <PhotoGallery />
      <div className={site.container}>
        <section className={g.note} aria-label="About the photographs">
          <p className={g.noteText}>{photography.note}</p>
          <div className={g.noteLinks}>
            <a href={photography.instagram} target="_blank" rel="noopener noreferrer">
              More on Instagram <span aria-hidden="true">↗</span>
            </a>
            <Link href="/beyond">
              Beyond the Interface <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
