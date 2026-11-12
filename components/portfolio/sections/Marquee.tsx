import { marqueeItems } from "@/lib/portfolio/content";

/** Velocity-reactive marquee; the track is moved by the motion layer. */
export default function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" id="mq">
        {items.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}
