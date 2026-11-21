import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import FieldOpsStudy, { FO } from "@/components/site/fieldops/FieldOpsStudy";

export const metadata: Metadata = { title: `${FO.title} — deep dive — Nishanth Silla`, description: FO.line };

export default function FieldOpsDeepDive() {
  return (
    <SiteShell>
      <FieldOpsStudy mode="deep" />
    </SiteShell>
  );
}
