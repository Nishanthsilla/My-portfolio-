import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import PhotographyBody from "@/components/site/photo/PhotographyBody";

export const metadata: Metadata = {
  title: "Photography — Nishanth Silla",
  description: "Frames, places and moments — photographs by Nishanth Silla.",
};

/** Photography (also opens from the homepage folder). */
export default function PhotographyPage() {
  return (
    <SiteShell>
      <PhotographyBody />
    </SiteShell>
  );
}
