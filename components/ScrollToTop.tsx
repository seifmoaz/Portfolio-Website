"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // `html{scroll-behavior:smooth}` makes plain scrollTo(0,0) an animated
    // scroll, which can land short or get interrupted — force it instant.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  return null;
}
