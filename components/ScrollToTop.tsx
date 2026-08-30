"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // A hash in the URL (e.g. "/#contact") means the browser should land on
    // that anchor. The browser/Next.js don't reliably do this on their own
    // for a cross-page navigation, so scroll to it explicitly.
    const hash = window.location.hash;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        return;
      }
    }
    // `html{scroll-behavior:smooth}` makes plain scrollTo(0,0) an animated
    // scroll, which can land short or get interrupted — force it instant.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return null;
}
