/** Custom cursor, magnetic elements and card tilt — ported from the original. */
import { gsap } from "gsap";

export function initPointer(root: HTMLElement): () => void {
  const G = gsap;
  const off: (() => void)[] = [];
  const on = (t: EventTarget, type: string, fn: EventListener) => {
    t.addEventListener(type, fn);
    off.push(() => t.removeEventListener(type, fn));
  };

  /* custom cursor */
  root.classList.add("has-cursor");
  const dotC = document.querySelector<HTMLElement>(".c-dot")!, ring = document.querySelector<HTMLElement>(".c-ring")!, lab = document.getElementById("cLabel")!;
  G.set([dotC, ring], { xPercent: -50, yPercent: -50 });
  const dx = G.quickTo(dotC, "x", { duration: 0.12, ease: "power3" }), dy = G.quickTo(dotC, "y", { duration: 0.12, ease: "power3" });
  const rx = G.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = G.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
  on(window, "pointermove", (e) => { const p = e as PointerEvent; dx(p.clientX); dy(p.clientY); rx(p.clientX); ry(p.clientY); });
  on(document, "pointerover", (e) => {
    const t = e.target as Element;
    const lbl = t.closest<HTMLElement>("[data-cursor]"), link = t.closest("a,button");
    ring.classList.toggle("label", !!lbl && !link);
    ring.classList.toggle("link", !!link);
    if (lbl) lab.textContent = lbl.dataset.cursor ?? "";
  });
  on(root, "mouseleave", () => { G.to([dotC, ring], { opacity: 0, duration: 0.2 }); });
  on(root, "mouseenter", () => { G.to([dotC, ring], { opacity: 1, duration: 0.2 }); });

  /* magnetic */
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    on(el, "pointermove", (e) => {
      const p = e as PointerEvent, r = el.getBoundingClientRect();
      G.to(el, { x: (p.clientX - r.left - r.width / 2) * 0.35, y: (p.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: "power3" });
    });
    on(el, "pointerleave", () => { G.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,.4)" }); });
  });

  /* card tilt */
  document.querySelectorAll<HTMLElement>(".card").forEach((card) => {
    on(card, "pointermove", (e) => {
      const p = e as PointerEvent, r = card.getBoundingClientRect(), px = (p.clientX - r.left) / r.width - 0.5, py = (p.clientY - r.top) / r.height - 0.5;
      G.to(card, { rotateY: px * 7, rotateX: -py * 7, transformPerspective: 1100, duration: 0.5, ease: "power3" });
    });
    on(card, "pointerleave", () => { G.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3" }); });
  });

  return () => off.splice(0).forEach((fn) => fn());
}
