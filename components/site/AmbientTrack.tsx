"use client";

import { useEffect } from "react";
import { ambient, type AmbientName } from "@/lib/sound/engine";

/** While this is on screen, its ambient track plays (if the visitor has sound on); it fades out when it goes. */
export default function AmbientTrack({ name }: { name: AmbientName }) {
  useEffect(() => {
    ambient(name);
    return () => ambient(null);
  }, [name]);
  return null;
}
