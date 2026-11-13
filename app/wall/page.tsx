import type { Metadata } from "next";
import WallApp from "@/components/wall/WallApp";

export const metadata: Metadata = {
  title: "The Wall — Nishanth Silla",
  description: "A thought, a note, or just a little sticker. Leave a little something on Nishanth's wall.",
};

/** The Wall — a full-screen guestbook (stickers + short notes, moderated before they appear). */
export default function WallPage() {
  return <WallApp />;
}
