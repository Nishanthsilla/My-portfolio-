import type { Metadata } from "next";
import AdminPortal from "@/components/admin/AdminPortal";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** the admin portal (?tab=notes | notifications | images picks the tab) */
export default function AdminPage() {
  return <AdminPortal initial="notes" fromUrl />;
}
