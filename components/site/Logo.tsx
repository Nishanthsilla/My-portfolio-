/**
 * Nishanth's logo: a lowercase "n" folded out of one ribbon (a rounded left
 * stem, a band rising over the shoulder into the right stem, the fold shaded
 * inside) and a rounded red square for a full stop. Traced from his artwork.
 *
 * <LogoN> is just the "n" (viewBox 753 × 563). The square is separate, so the
 * navbar can keep it as its own element: the intro film lands its dot on it.
 * <Logo> is the whole thing (viewBox 961 × 563). `mono` draws it in one colour.
 */
export const LOGO_RED = "#f50427";
const N = {
  stem: "M0 391V76Q0 0 76 0H210Q286 0 286 76V106Z",
  band: "M0 391L303 89C363 34 433 11 503 11C643 11 753 96 753 246V551Q753 563 741 563H473V241L168 543Q148 563 113 563H12Q0 563 0 551Z",
  fold: "M470 563V241L580 131C618 96 688 91 716 121C743 166 753 206 753 246V551Q753 563 741 563Z",
};

function NShapes({ id, mono }: { id: string; mono?: boolean }) {
  if (mono)
    return (
      <g fill="currentColor">
        <path d={N.stem} />
        <path d={N.band} />
      </g>
    );
  return (
    <>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6640" />
          <stop offset="0.6" stopColor="#ff2a35" />
          <stop offset="1" stopColor="#c8001f" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0.5" x2="1" y2="0.3">
          <stop offset="0" stopColor="#ff6a3d" />
          <stop offset="0.55" stopColor="#ff3b3e" />
          <stop offset="1" stopColor="#ff1235" />
        </linearGradient>
        <linearGradient id={`${id}-c`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#8a0018" />
          <stop offset="0.45" stopColor="#d4002a" />
          <stop offset="1" stopColor="#f2062b" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-a)`} d={N.stem} />
      <path fill={`url(#${id}-b)`} d={N.band} />
      <path fill={`url(#${id}-c)`} d={N.fold} />
    </>
  );
}

export function LogoN({ height, id = "logo-n", className }: { height: number; id?: string; className?: string }) {
  return (
    <svg className={className} width={(height * 753) / 563} height={height} viewBox="0 0 753 563" aria-hidden="true">
      <NShapes id={id} />
    </svg>
  );
}

export default function Logo({ className, id = "logo", mono }: { className?: string; id?: string; mono?: string }) {
  return (
    <svg className={className} viewBox="0 0 961 563" aria-hidden="true" style={mono ? { color: mono } : undefined}>
      <NShapes id={id} mono={!!mono} />
      <rect fill={mono ? "currentColor" : LOGO_RED} x="783" y="399" width="178" height="164" rx="40" />
    </svg>
  );
}
