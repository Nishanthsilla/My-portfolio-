import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import BeyondJournal from "@/components/site/beyond/BeyondJournal";

export const metadata: Metadata = {
  title: "Beyond the Interface — Nishanth Silla",
  description: "Experiments beyond the screen — physical products, prototypes and ideas Nishanth is exploring.",
};

/** Beyond the Interface (also opens from the homepage folder). */
export default function BeyondPage() {
  return (
    <SiteShell>
      <BeyondJournal />
    </SiteShell>
  );
}
