"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    const scrollToTarget = () => {
      // A hash in the URL (e.g. "/#contact") means the browser should land
      // on that anchor. The browser/Next.js don't reliably do this on their
      // own for a cross-page navigation, so scroll to it explicitly.
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          // `html{scroll-behavior:smooth}` makes an unqualified/"smooth"
          // scroll unreliable (it can silently no-op) — force instant.
          target.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
          return;
        }
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    scrollToTarget();

    // Content above the target (hero video, lazy-loaded images, reveal-on-
    // scroll sections) can still be loading/resizing right after mount,
    // which shifts the target further down than where we just scrolled to.
    // Keep correcting for a short window, then stop so this doesn't fight
    // the user's own scrolling once the page has settled.
    const ro = new ResizeObserver(scrollToTarget);
    ro.observe(document.body);
    const timeout = setTimeout(() => ro.disconnect(), 1500);

    return () => {
      ro.disconnect();
      clearTimeout(timeout);
    };
  }, []);
  return null;
}
