import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import CaseStudy from "@/components/site/study/CaseStudy";
import PortfolioHero from "@/components/site/portfolioCover/Hero";
import { thisPortfolio as st } from "@/lib/site/studies/thisPortfolio";

export const metadata: Metadata = { title: `${st.title} — full case study — Nishanth Silla`, description: st.subtitle };

export default function ThisPortfolioCaseStudy() {
  return (
    <SiteShell>
      <CaseStudy study={st} media={<PortfolioHero />} />
    </SiteShell>
  );
}
