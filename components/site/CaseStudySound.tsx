"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { sfx } from "@/lib/sound/engine";

/** A soft "book opening" each time a case study page opens (only with sound on; never on a cold page load). */
export default function CaseStudySound() {
  const path = usePathname();
  useEffect(() => {
    sfx("open");
  }, [path]);
  return null;
}
