import type { Metadata } from "next";
import NextUp from "@/components/site/NextUp";
import SiteShell from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "About — Nishanth Silla" };

export default function AboutPage() {
  return (
    <SiteShell>
      <NextUp
        eyebrow="About"
        title="About"
        line="Experience, approach, skills and education from the current portfolio. This page is being built next."
      />
    </SiteShell>
  );
}
