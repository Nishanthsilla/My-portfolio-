"use client";

import { useEffect } from "react";
import { initPortfolioMotion } from "./initMotion";

/** Mounts the portfolio's scroll/interaction motion once the sections are in the DOM. */
export default function PortfolioMotion() {
  useEffect(() => initPortfolioMotion(), []);
  return null;
}
