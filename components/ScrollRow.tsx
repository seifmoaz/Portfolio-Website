"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Wraps an existing horizontally-scrolling row (overflow-x:auto + scroll-
// snap, already in place on .featured-grid/.project-grid) with prev/next
// arrow buttons. The buttons are purely an addition — native wheel/trackpad
// and touch-swipe scrolling on the row itself are untouched.
export default function ScrollRow({ className, children }: { className: string; children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
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

  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (scrollerRef.current) scrollerRef.current.style.scrollSnapType = "";
    },
    [],
  );

  // One "step" is a single card's width — or, on the featured grid's 2-row
  // layout, one column's width, which is the same measurement since every
  // item in a grid-auto-columns track shares that track's width — plus the
  // gap after it. Moving by that amount reveals exactly the next item plus
  // a peek of the one after, instead of jumping to a whole new set.
  const stepDistance = (el: HTMLDivElement) => {
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return el.clientWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  // Animates scrollLeft directly via rAF instead of scrollTo/scrollBy's
  // native `behavior: "smooth"` — that native animation is inconsistent
  // (silently a no-op in some browser/automation contexts) while a plain
  // scrollLeft assignment always works, so driving it by hand every frame
  // guarantees the sliding motion actually happens everywhere.
  const scrollByStep = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);

    const start = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.min(Math.max(start + dir * stepDistance(el), 0), max);
    const change = target - start;
    const duration = 380;
    const startTime = performance.now();

    // CSS scroll-snap fights a hand-driven scrollLeft animation: the
    // browser can correct each intermediate frame straight to the nearest
    // snap point, which reads as an instant jump instead of a glide.
    // Suspend snapping only for the animation's duration, then restore it
    // so real wheel/touch scrolling still snaps as before.
    el.style.scrollSnapType = "none";

    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      // Ease-in-out cubic — gentler acceleration and deceleration than a
      // pure ease-out, reads as a smoother, more deliberate glide.
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      el.scrollLeft = start + change * eased;
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
        el.style.scrollSnapType = "";
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="scroll-row">
      <div className={className} ref={scrollerRef}>
        {children}
      </div>
      {canScrollLeft && (
        <button className="scroll-arrow prev" aria-label="Scroll left" onClick={() => scrollByStep(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button className="scroll-arrow next" aria-label="Scroll right" onClick={() => scrollByStep(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
