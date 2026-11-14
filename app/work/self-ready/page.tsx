import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import Overview from "@/components/site/study/Overview";
import { selfReadyStudy as st } from "@/lib/site/studies/selfReady";

export const metadata: Metadata = { title: `${st.title} — Nishanth Silla`, description: st.subtitle };

export default function SelfReadyOverview() {
  return (
    <SiteShell>
      <Overview study={st} back={{ href: "/?c=product-strategy#work", label: "Product Strategy" }} />
    </SiteShell>
  );
}
