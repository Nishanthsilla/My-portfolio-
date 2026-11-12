/**
 * Intro coordination. Module-level state survives client-side navigation but
 * resets on a full document load (first visit or refresh), which is exactly
 * when the intro plays.
 *
 *  - "reveal": the homepage starts emerging (the portfolio runs its entrance).
 *  - "done":   the loader is gone and the page is at rest (layout can be re-measured).
 */
export const introState = { played: false, revealed: false, done: false };

type Cb = () => void;
const revealCbs = new Set<Cb>();
const doneCbs = new Set<Cb>();

const fire = (set: Set<Cb>) => {
  const list = Array.from(set);
  set.clear();
  list.forEach((cb) => cb());
};

export function announceReveal() {
  if (introState.revealed) return;
  introState.revealed = true;
  fire(revealCbs);
}

export function announceDone() {
  announceReveal();
  if (introState.done) return;
  introState.done = true;
  fire(doneCbs);
}

export function onIntroReveal(cb: Cb): () => void {
  if (introState.revealed) {
    cb();
    return () => {};
  }
  revealCbs.add(cb);
  return () => revealCbs.delete(cb);
}

export function onIntroDone(cb: Cb): () => void {
  if (introState.done) {
    cb();
    return () => {};
  }
  doneCbs.add(cb);
  return () => doneCbs.delete(cb);
}
