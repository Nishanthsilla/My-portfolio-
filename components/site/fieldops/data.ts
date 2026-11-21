/**
 * Field Operations Health: the data shown in Nishanth's final design (L7 · TSM,
 * All India), transcribed cell by cell from the design so the replica matches it.
 * Status is stored per cell as it appears in the design (the product rounds
 * scores for display, so a "40" can read Critical and a "60" Attention).
 */
export type Status = "critical" | "attention" | "moderate" | "healthy";
const S: Record<string, Status> = { c: "critical", a: "attention", m: "moderate", h: "healthy" };

/** the 104 TSM cells, in the design's natural order: [score, status] */
export const CELLS: { score: number; status: Status; n: number }[] = ([[56,"a"],[40,"c"],[48,"a"],[56,"a"],[47,"a"],[55,"a"],[66,"m"],[57,"a"],[50,"a"],[40,"c"],[44,"a"],[78,"m"],[67,"m"],[84,"h"],[59,"a"],[52,"a"],[52,"a"],[59,"a"],[44,"a"],[60,"a"],[61,"m"],[61,"m"],[62,"m"],[43,"a"],[47,"a"],[54,"a"],[93,"h"],[69,"m"],[58,"a"],[61,"m"],[59,"a"],[81,"h"],[99,"h"],[48,"a"],[46,"a"],[38,"c"],[81,"h"],[50,"a"],[65,"m"],[73,"m"],[56,"a"],[44,"a"],[47,"a"],[53,"a"],[55,"a"],[69,"m"],[59,"a"],[51,"a"],[58,"a"],[55,"a"],[68,"m"],[44,"a"],[64,"m"],[61,"m"],[65,"m"],[43,"a"],[49,"a"],[60,"a"],[49,"a"],[63,"m"],[57,"a"],[58,"a"],[42,"a"],[71,"m"],[50,"a"],[65,"m"],[43,"a"],[22,"c"],[61,"m"],[61,"m"],[48,"a"],[47,"a"],[48,"a"],[67,"m"],[60,"m"],[55,"a"],[61,"m"],[86,"h"],[53,"a"],[68,"m"],[54,"a"],[38,"c"],[51,"a"],[71,"m"],[52,"a"],[63,"m"],[52,"a"],[64,"m"],[43,"a"],[62,"m"],[66,"m"],[60,"m"],[66,"m"],[44,"a"],[74,"m"],[29,"c"],[42,"a"],[65,"m"],[62,"m"],[51,"a"],[47,"a"],[62,"m"],[57,"a"],[57,"a"]] as [number, string][]).map(([score, k], i) => ({ score, status: S[k], n: i + 1 }));

/** the palette, sampled from the design */
export const STATUS: Record<Status, { label: string; range: string; bg: string; fg: string; chipBg: string; chipFg: string; meaning: string }> = {
  critical: { label: "Critical", range: "< 40", bg: "#cc2e61", fg: "#ffffff", chipBg: "#fbe4ec", chipFg: "#b81f55", meaning: "Requires immediate investigation." },
  attention: { label: "Attention", range: "< 60", bg: "#ec7f42", fg: "#3a1606", chipBg: "#fde9dc", chipFg: "#b4501b", meaning: "Requires management attention." },
  moderate: { label: "Moderate", range: "< 80", bg: "#fcd96c", fg: "#311e00", chipBg: "#fdf3cf", chipFg: "#86650f", meaning: "Opportunity for improvement." },
  healthy: { label: "Healthy", range: "≥ 80", bg: "#b2d8bb", fg: "#003010", chipBg: "#e3f1e7", chipFg: "#2e6b40", meaning: "Performing within the expected range." },
};
export const ORDER: Status[] = ["critical", "attention", "moderate", "healthy"];

/** the hierarchy tabs, with the entity counts shown in the design */
export const LEVELS = [
  { l: "L2", d: "AVP", n: 2 },
  { l: "L3", d: "GM", n: 4 },
  { l: "L4", d: "RM", n: 7 },
  { l: "L5", d: "BM", n: 13 },
  { l: "L6", d: "SM", n: 38 },
  { l: "L7", d: "TSM", n: 104 },
  { l: "L8", d: "ASM", n: 120 },
];
export const SUMMARY = { entities: 104, overall: 57, overallStatus: "Attention", unassigned: 17 };
export const count = (st: Status) => CELLS.filter((c) => c.status === st).length;
