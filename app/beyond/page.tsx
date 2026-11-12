import type { Metadata } from "next";
import NextUp from "@/components/site/NextUp";
import SiteShell from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Beyond the Interface — Nishanth Silla" };

export default function BeyondPage() {
  return (
    <SiteShell>
      <NextUp
        eyebrow="Personal explorations"
        title="Beyond the Interface"
        line="Photography, 3D printing, MODULAR 01 and other ideas I explore. This page is being built next."
      />
    </SiteShell>
  );
}
