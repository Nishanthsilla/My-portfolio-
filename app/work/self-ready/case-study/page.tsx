import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import CaseStudy from "@/components/site/study/CaseStudy";
import { selfReadyStudy as st } from "@/lib/site/studies/selfReady";

export const metadata: Metadata = { title: `${st.title} — case study — Nishanth Silla`, description: st.subtitle };

export default function SelfReadyCaseStudy() {
  return (
    <SiteShell>
      <CaseStudy study={st} />
    </SiteShell>
  );
}
