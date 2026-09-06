"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { layoutMasonry, type Placement } from "@/lib/masonry";

export type PinItem = {
  key: string;
  src: string;
  alt: string;
  isVideo?: boolean;
};

const DEFAULT_RATIO = 0.8; // portrait-ish guess used before an item's real size is known

function columnsForWidth(width: number): number {
  if (width <= 760) return 2;
  if (width <= 1100) return 4;
  return 6;
}

export default function PinterestGrid({ items }: { items: PinItem[] }) {
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

  // Clean up any still-attached video observers when the whole grid unmounts.
  useEffect(() => {
    const observers = videoObservers.current;
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const recordRatio = (key: string, ratio: number) => {
    if (!ratio || !Number.isFinite(ratio)) return;
    setRatios((prev) => (prev[key] ? prev : { ...prev, [key]: ratio }));
  };

  // Plays a video only while it's actually in (or near) the viewport, rather
  // than every video on the grid trying to autoplay/download at once.
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

  const numColumns = containerWidth > 0 ? columnsForWidth(containerWidth) : 6;
  const gap = numColumns <= 2 ? 14 : 22;

  const { placements, height } = useMemo(() => {
    if (!containerWidth) return { placements: [] as Placement[], height: 0 };
    const withRatios = items.map((item) => ({ key: item.key, ratio: ratios[item.key] ?? DEFAULT_RATIO }));
    return layoutMasonry(withRatios, numColumns, containerWidth, gap);
  }, [items, ratios, numColumns, containerWidth, gap]);

  const placementByKey = useMemo(() => {
    const map = new Map<string, Placement>();
    placements.forEach((p) => map.set(p.key, p));
    return map;
  }, [placements]);

  return (
    <div className="pin-grid" ref={containerRef} style={{ position: "relative", height }}>
      {items.map((item) => {
        const p = placementByKey.get(item.key);
        const style: CSSProperties = p
          ? { position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height }
          : { position: "absolute", visibility: "hidden" };
        return (
          <div key={item.key} className="pin-item" style={style}>
            {item.isVideo ? (
              <video
                muted
                loop
                playsInline
                preload="metadata"
                ref={attachVideoRef(item.key)}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  if (v.videoWidth && v.videoHeight) recordRatio(item.key, v.videoWidth / v.videoHeight);
                }}
              >
                <source src={item.src} />
              </video>
            ) : (
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                ref={(img) => {
                  if (img && img.complete && img.naturalWidth && img.naturalHeight) {
                    recordRatio(item.key, img.naturalWidth / img.naturalHeight);
                  }
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) recordRatio(item.key, img.naturalWidth / img.naturalHeight);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
