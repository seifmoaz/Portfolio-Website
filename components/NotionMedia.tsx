"use client";

import { mediaSrc } from "@/lib/notion-media";
import type { MediaRef } from "@/lib/notion";
import { useAutoplayInView } from "@/lib/useAutoplayInView";

export default function NotionMedia({
  media,
  alt,
  className,
  trim,
  width = 1400,
}: {
  media: MediaRef | null | undefined;
  alt: string;
  className?: string;
  trim?: boolean;
  width?: number;
}) {
  const playRef = useAutoplayInView();

  if (media?.isVideo) {
    const src = mediaSrc(media);
    if (!src) return null;
    return (
      <video ref={playRef} className={className} muted loop playsInline preload="metadata">
        <source src={src} />
      </video>
    );
  }

  const src = mediaSrc(media, { trim, width });
  if (!src) return null;
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />;
}
