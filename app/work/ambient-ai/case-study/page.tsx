import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import CaseStudy from "@/components/site/study/CaseStudy";
import { ambientAi as st } from "@/lib/site/studies/ambientAi";

export const metadata: Metadata = { title: `${st.title} — case study — Nishanth Silla`, description: st.subtitle };

export default function AmbientAiCaseStudy() {
  return (
    <SiteShell>
      <CaseStudy study={st} />
    </SiteShell>
  );
}
