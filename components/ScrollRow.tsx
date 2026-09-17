"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Wraps an existing horizontally-scrolling row (overflow-x:auto + scroll-
// snap, already in place on .featured-grid/.project-grid) with prev/next
// arrow buttons. The buttons are purely an addition — native wheel/trackpad
// and touch-swipe scrolling on the row itself are untouched.
export default function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // Animates scrollLeft directly via rAF instead of scrollTo/scrollBy's
  // native `behavior: "smooth"` — that native animation is inconsistent
  // (silently a no-op in some browser/automation contexts) while a plain
  // scrollLeft assignment always works, so driving it by hand every frame
  // guarantees the sliding motion actually happens everywhere.
  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const start = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.min(Math.max(start + dir * el.clientWidth * 0.8, 0), max);
    const change = target - start;
    const duration = 400;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.scrollLeft = start + change * eased;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="scroll-row">
      <div className={className} ref={scrollerRef}>
        {children}
      </div>
      {canScrollLeft && (
        <button className="scroll-arrow prev" aria-label="Scroll left" onClick={() => scrollByPage(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button className="scroll-arrow next" aria-label="Scroll right" onClick={() => scrollByPage(1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
