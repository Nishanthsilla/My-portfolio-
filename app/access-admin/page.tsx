import type { Metadata } from "next";
import AccessAdmin from "@/components/site/study/AccessAdmin";

export const metadata: Metadata = { title: "Confidential screens — access", robots: { index: false, follow: false } };

export default function AccessAdminPage() {
  return <AccessAdmin />;
}
