"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { layoutMasonry, type Placement } from "@/lib/masonry";
import type { MediaRef } from "@/lib/notion";
import { mediaSrc } from "@/lib/notion-media";

const DEFAULT_RATIO = 0.8; // portrait-ish guess used before an item's real size is known

// A plain absolutely-positioned masonry, not CSS column-count: Safari's
// multi-column layout engine is unreliable with async-loading media — it
// can intermittently mis-paint a phantom, non-interactive box while
// rebalancing columns, which is exactly the bug already hit and fixed on
// the Side Quests section. Positioning every item with an explicit pixel
// box (like PinterestGrid and ShowcaseVideoGrid) sidesteps that whole class
// of bug rather than needing a fix each time it resurfaces somewhere new.
function columnsForWidth(width: number): number {
  if (width <= 1000) return 2;
  return 3;
}

function keyFor(media: MediaRef): string {
  return `${media.property}-${media.index}`;
}

export default function GalleryGrid({ items, alt }: { items: MediaRef[]; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const videoObservers = useRef<Map<string, IntersectionObserver>>(new Map());

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (el) setContainerWidth(el.clientWidth);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const observers = videoObservers.current;
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const recordRatio = (key: string, ratio: number) => {
    if (!ratio || !Number.isFinite(ratio)) return;
    setRatios((prev) => (prev[key] ? prev : { ...prev, [key]: ratio }));
  };

  // Plays a gallery video only while it's actually in (or near) the
  // viewport, rather than every video in the gallery trying to
  // autoplay/download at once — same treatment as the Photography grid.
  const attachVideoRef = (key: string) => (video: HTMLVideoElement | null) => {
    videoObservers.current.get(key)?.disconnect();
    videoObservers.current.delete(key);
    if (!video) return;
    if (video.readyState >= 1 && video.videoWidth && video.videoHeight) {
      recordRatio(key, video.videoWidth / video.videoHeight);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(video);
    videoObservers.current.set(key, io);
  };

  const numColumns = containerWidth > 0 ? columnsForWidth(containerWidth) : 3;
  const gap = containerWidth > 0 && containerWidth <= 640 ? 12 : 24;

  const { placements, height } = useMemo(() => {
    if (!containerWidth) return { placements: [] as Placement[], height: 0 };
    const withRatios = items.map((item) => ({ key: keyFor(item), ratio: ratios[keyFor(item)] ?? DEFAULT_RATIO }));
    return layoutMasonry(withRatios, numColumns, containerWidth, gap);
  }, [items, ratios, numColumns, containerWidth, gap]);

  const placementByKey = useMemo(() => {
    const map = new Map<string, Placement>();
    placements.forEach((p) => map.set(p.key, p));
    return map;
  }, [placements]);

  return (
    <div className="gallery-masonry" ref={containerRef} style={{ position: "relative", height }}>
      {items.map((item) => {
        const key = keyFor(item);
        const p = placementByKey.get(key);
        const style: CSSProperties = p
          ? { position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height }
          : { position: "absolute", visibility: "hidden" };
        const src = mediaSrc(item, item.isVideo ? undefined : { width: 1400 });
        if (!src) return null;
        return (
          <div className="gallery-item" style={style} key={key}>
            {item.isVideo ? (
              <video muted loop playsInline preload="metadata" ref={attachVideoRef(key)}>
                <source src={src} />
              </video>
            ) : (
              <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                ref={(img) => {
                  if (img && img.complete && img.naturalWidth && img.naturalHeight) {
                    recordRatio(key, img.naturalWidth / img.naturalHeight);
                  }
                }}
                onLoad={(e) => {
                  const el = e.currentTarget;
                  if (el.naturalWidth && el.naturalHeight) recordRatio(key, el.naturalWidth / el.naturalHeight);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
