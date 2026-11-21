import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import FieldOpsStudy, { FO } from "@/components/site/fieldops/FieldOpsStudy";

export const metadata: Metadata = { title: `${FO.title} — ${FO.product} — Nishanth Silla`, description: FO.line };

export default function FieldOpsOverview() {
  return (
    <SiteShell>
      <FieldOpsStudy mode="overview" />
    </SiteShell>
  );
}
