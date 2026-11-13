"use client";

import { createContext } from "react";

export type BranchId = "beyond" | "photography";

/** Lets the folders (scene 3) open their content in the sheet below the journey. */
export const JourneyContext = createContext<{ openBranch: (id: BranchId, photo?: number) => void } | null>(null);
