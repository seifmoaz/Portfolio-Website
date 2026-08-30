"use client";

import { useCallback, useRef } from "react";

// Starts/pauses a <video> based on viewport visibility, instead of every
// video on a page trying to autoplay (and download) at once on load.
export function useAutoplayInView() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback((video: HTMLVideoElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    observerRef.current = io;
  }, []);
}
