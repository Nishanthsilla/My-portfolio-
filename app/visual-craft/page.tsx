import type { Metadata } from "next";
import CategoryPage from "@/components/site/CategoryPage";

export const metadata: Metadata = { title: "Visual Craft — Nishanth Silla" };

export default function Page() {
  return <CategoryPage id="visual-craft" />;
}
