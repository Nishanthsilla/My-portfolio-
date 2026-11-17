/** Pixel "deal with it" glasses, drawn on a 26 × 5 grid so they stay crisp at any size. */
const ROWS = [
  "##########################",
  "##o#o#######..##o#o#######",
  ".##o#o######..###o#o#####.",
  "..##o#o####....###o#o###..",
  "...#######......#######...",
];

export default function SwagGlasses({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 26 5" shapeRendering="crispEdges" aria-hidden="true">
      {ROWS.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c === "#" ? "#111" : "#fff"} />,
        ),
      )}
    </svg>
  );
}
