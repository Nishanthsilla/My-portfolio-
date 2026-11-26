import type { Metadata } from "next";
import AdminPortal from "@/components/admin/AdminPortal";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** the admin portal: opens on Analytics (?tab=notes | notifications | images picks another tab) */
export default function AdminPage() {
  return <AdminPortal initial="analytics" fromUrl />;
}
