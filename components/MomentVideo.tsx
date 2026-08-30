"use client";

import { useAutoplayInView } from "@/lib/useAutoplayInView";

// A decorative muted/looped background clip — only plays while actually
// scrolled into view, same treatment as the Notion-driven galleries.
export default function MomentVideo({ src, poster }: { src: string; poster?: string }) {
  const playRef = useAutoplayInView();
  return (
    <video ref={playRef} muted loop playsInline preload="metadata" poster={poster}>
      <source src={src} />
    </video>
  );
}
