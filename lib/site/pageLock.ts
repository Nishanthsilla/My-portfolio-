/**
 * Holds the page still while something opens on top of it (the chat, a project panel, the photo
 * viewer). Unlike `overflow: hidden` it keeps the homepage's pinned frame in place, so the page
 * stays visible behind the overlay. Wheel, trackpad, touch and keyboard scrolling outside the
 * overlay are stopped, and if anything still moves the page (a scroll carrying on out of the
 * overlay when its content ends) it is put straight back.
 */
let locks = 0;

export function lockPage(overlay: () => Element | null | undefined): () => void {
  const html = document.documentElement;
  locks++;
  html.dataset.overlay = "";
  const frame = document.querySelector<HTMLElement>("[data-journey-frame]");
  const y = scrollY, x = frame?.scrollLeft ?? 0;

  // can this element (or one of its parents inside the overlay) still scroll the way the wheel points?
  const canScroll = (t: Element | null, dx: number, dy: number) => {
    const root = overlay();
    for (let n = t as HTMLElement | null; n && root && root.contains(n); n = n.parentElement) {
      const c = getComputedStyle(n);
      if (dy && /(auto|scroll)/.test(c.overflowY) && n.scrollHeight > n.clientHeight + 1)
        if ((dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) || (dy < 0 && n.scrollTop > 0)) return true;
      if (dx && /(auto|scroll)/.test(c.overflowX) && n.scrollWidth > n.clientWidth + 1)
        if ((dx > 0 && n.scrollLeft + n.clientWidth < n.scrollWidth - 1) || (dx < 0 && n.scrollLeft > 0)) return true;
    }
    return false;
  };
  const wheel = (e: WheelEvent) => {
    if (e.ctrlKey) return; // pinch-zoom stays the browser's
    if (!canScroll(e.target as Element, e.deltaX, e.deltaY)) e.preventDefault();
  };
  let ty = 0, tx = 0;
  const tstart = (e: TouchEvent) => { ty = e.touches[0]?.clientY ?? 0; tx = e.touches[0]?.clientX ?? 0; };
  const tmove = (e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    if (!canScroll(e.target as Element, tx - t.clientX, ty - t.clientY)) e.preventDefault();
  };
  const keys = (e: KeyboardEvent) => {
    if ([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && !(e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]") && !overlay()?.contains(e.target as Node))
      e.preventDefault();
  };
  // the last line of defence: anything that moved the page goes straight back
  const hold = () => {
    if (scrollY !== y) scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    if (frame && frame.scrollLeft !== x) frame.scrollLeft = x;
  };
  addEventListener("wheel", wheel, { passive: false, capture: true });
  addEventListener("touchstart", tstart, { passive: true, capture: true });
  addEventListener("touchmove", tmove, { passive: false, capture: true });
  addEventListener("keydown", keys, { capture: true });
  addEventListener("scroll", hold, { capture: true, passive: true });
  frame?.addEventListener("scroll", hold, { passive: true });

  let done = false;
  return () => {
    if (done) return;
    done = true;
    removeEventListener("wheel", wheel, { capture: true });
    removeEventListener("touchstart", tstart, { capture: true });
    removeEventListener("touchmove", tmove, { capture: true });
    removeEventListener("keydown", keys, { capture: true });
    removeEventListener("scroll", hold, { capture: true });
    frame?.removeEventListener("scroll", hold);
    if (--locks <= 0) {
      locks = 0;
      delete html.dataset.overlay;
    }
  };
}
