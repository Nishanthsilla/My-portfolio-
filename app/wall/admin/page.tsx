import type { Metadata } from "next";
import WallAdmin from "@/components/wall/WallAdmin";

export const metadata: Metadata = {
  title: "The Wall — moderation",
  robots: { index: false, follow: false },
};

export default function WallAdminPage() {
  return <WallAdmin />;
}
