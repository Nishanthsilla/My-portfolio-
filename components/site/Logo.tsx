/**
 * Nishanth's logo: a lowercase "n" folded out of two slabs (a light coral one
 * rising from the left, a deep red stem with a rounded shoulder) and a red
 * square for a full stop. Traced from his own artwork.
 *
 * <LogoN> is just the "n" (viewBox 297 × 184). The square is separate, so the
 * navbar can keep it as its own element: the intro film lands its dot on it.
 * <Logo> is the whole thing (viewBox 361 × 184).
 */
export const LOGO_RED = "#e60a30";
const N_ASPECT = 297 / 184;

function Shapes({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="1" x2="1" y2="0.2">
          <stop offset="0" stopColor="#ff6a64" />
          <stop offset="0.75" stopColor="#ff4250" />
          <stop offset="1" stopColor="#f2243c" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id}-a)`} d="M0 184V116L107 0H242L80 184Z" />
      <path fill={LOGO_RED} d="M242 0H264A33 33 0 0 1 297 33V116L233 184H193V56Z" />
    </>
  );
}

export function LogoN({ height, id = "logo-n", className }: { height: number; id?: string; className?: string }) {
  return (
    <svg className={className} width={height * N_ASPECT} height={height} viewBox="0 0 297 184" aria-hidden="true">
      <Shapes id={id} />
    </svg>
  );
}

export default function Logo({ className, id = "logo", mono }: { className?: string; id?: string; mono?: string }) {
  return (
    <svg className={className} viewBox="0 0 361 184" aria-hidden="true" style={mono ? { color: mono } : undefined}>
      {mono ? (
        <g fill="currentColor">
          <path d="M0 184V116L107 0H242L80 184Z" />
          <path d="M242 0H264A33 33 0 0 1 297 33V116L233 184H193V56Z" />
          <rect x="297" y="120" width="64" height="64" />
        </g>
      ) : (
        <>
          <Shapes id={id} />
          <rect fill={LOGO_RED} x="297" y="120" width="64" height="64" />
        </>
      )}
    </svg>
  );
}
