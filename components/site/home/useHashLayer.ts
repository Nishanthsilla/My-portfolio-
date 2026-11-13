"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
};

/**
 * A layer over the homepage (the full-screen wall, a folder's sheet) tied to
 * the URL fragment, so it has its own history entry: browser Back, the phone's
 * back gesture and the layer's own close button all return to the page exactly
 * as it was — no navigation, no lost scroll position.
 */
export function useHashLayer() {
  const hash = useSyncExternalStore(subscribe, () => location.hash.slice(1), () => "");
  const pushed = useRef(false);

  const open = useCallback((name: string) => {
    pushed.current = true;
    location.hash = name;
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // removes the layer's entry: back where the visitor was
    } else {
      // arrived on a link to the layer: drop the fragment without leaving the page
      history.replaceState(history.state, "", location.pathname + location.search);
      dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, []);

  return { hash, open, close };
}
