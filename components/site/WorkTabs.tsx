"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { categories, projectsIn, type CategoryId } from "@/lib/site/content";
import ProjectCard, { PlaceholderCard } from "./ProjectCard";
import AnimatedContent from "./reactbits/AnimatedContent";
import s from "./site.module.css";

/**
 * The three work categories as one tab group. Switching is instant and in
 * place (cards fade up with a 70ms stagger), the URL keeps ?c= so a category
 * can be shared, and the page never jumps unexpectedly.
 */
export default function WorkTabs() {
  // the category in the URL (?c=…) on arrival; the visitor's own choice takes over once they switch
  const fromUrl = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(location.search).get("c"),
    () => null,
  );
  const [chosen, setActive] = useState<CategoryId | null>(null);
  const active: CategoryId = chosen ?? (categories.some((k) => k.id === fromUrl) ? (fromUrl as CategoryId) : "product-strategy");
  const [switched, setSwitched] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridTop = useRef<HTMLDivElement>(null);

  const select = (id: CategoryId, focus = false) => {
    if (id === active) return;
    setActive(id);
    setSwitched((n) => n + 1);
    const url = new URL(location.href);
    url.searchParams.set("c", id);
    history.replaceState(history.state, "", url);
    const btn = tabsRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${id}"]`);
    if (focus) btn?.focus();
    // on narrow screens the tab row scrolls sideways: keep the chosen tab fully visible
    btn?.scrollIntoView({ inline: "nearest", block: "nearest" });
    // if the visitor is already past the top of the grid, bring the new set into view (no jump otherwise)
    const top = gridTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) gridTop.current?.scrollIntoView({ block: "start" });
  };

  const onKey = (e: KeyboardEvent) => {
    const i = categories.findIndex((c) => c.id === active);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? categories.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    select(categories[(next + categories.length) % categories.length].id, true);
  };

  const list = projectsIn(active);
  return (
    <>
      <div className={s.tabsBar}>
        <div className={s.container}>
          <div ref={tabsRef} className={s.tabs} role="tablist" aria-label="Work categories" onKeyDown={onKey}>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                data-tab={c.id}
                aria-selected={active === c.id}
                aria-controls="work-panel"
                tabIndex={active === c.id ? 0 : -1}
                className={s.tab}
                onClick={() => select(c.id)}
              >
                {c.label}
                <span className={s.tabCount}>{projectsIn(c.id).length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div ref={gridTop} className={s.container} style={{ scrollMarginTop: 68 + 57 + 24 }}>
        {(() => {
          const cards = [
            ...list.map((p) => <ProjectCard key={p.slug} project={p} />),
            ...(active === "design-engineering"
              ? [<PlaceholderCard key="more" title="More work coming soon" note="Prototypes, component libraries and shipped interfaces — details to be updated." />]
              : []),
          ];
          const panel = { id: "work-panel", role: "tabpanel", "aria-labelledby": `tab-${active}` } as const;
          // first view: cards reveal once as the grid scrolls into view; later switches use a quick CSS fade-up
          return switched ? (
            <div {...panel} key={`${active}-${switched}`} className={`${s.grid} ${s.gridSwitch}`}>{cards}</div>
          ) : (
            <AnimatedContent {...panel} className={s.grid} distance={16} duration={0.55} ease="power3.out" stagger={0.08} threshold={0.12}>
              {cards}
            </AnimatedContent>
          );
        })()}
      </div>
    </>
  );
}
