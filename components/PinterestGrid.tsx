"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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

function spanForRatio(ratio: number, numColumns: number): number {
  if (ratio >= 1.9) return Math.min(3, numColumns);
  if (ratio >= 1.2) return Math.min(2, numColumns);
  return 1;
}

type Placement = { key: string; left: number; top: number; width: number; height: number };

// True skyline/masonry placement: each item goes at the lowest possible
// position for its column-span, and only the columns it actually occupies
// are pushed down. Unlike CSS Grid's row-based auto-placement (even with
// grid-auto-flow: dense, which is a greedy row scan, not a real 2D packer),
// this can't leave an unfilled hole — every column is a contiguous stack.
//
// The one way a skyline packer like this *can* still strand a gap: a
// multi-column item anchors to the tallest column it spans, leaving dead
// space under any shorter column it also covers. So a span is only used
// when the columns it would cover are already within GAP_TOLERANCE of each
// other — otherwise it falls back to a narrower span (always down to 1,
// which spans a single column and can never create waste).
const GAP_TOLERANCE = 24; // px — roughly one gap's worth of "close enough"

function layoutMasonry(
  items: { key: string; ratio: number }[],
  numColumns: number,
  containerWidth: number,
  gap: number,
): { placements: Placement[]; height: number } {
  const colWidth = (containerWidth - (numColumns - 1) * gap) / numColumns;
  const colBottoms = new Array(numColumns).fill(0);
  const placements: Placement[] = [];

  for (const item of items) {
    const idealSpan = spanForRatio(item.ratio, numColumns);
    let chosen: { start: number; span: number; top: number } | null = null;

    for (let span = idealSpan; span >= 1 && !chosen; span--) {
      let bestStart = -1;
      let bestTop = Infinity;
      for (let start = 0; start <= numColumns - span; start++) {
        const slice = colBottoms.slice(start, start + span);
        const top = Math.max(...slice);
        const wasted = slice.reduce((sum, c) => sum + (top - c), 0);
        if (wasted <= GAP_TOLERANCE && top < bestTop) {
          bestTop = top;
          bestStart = start;
        }
      }
      if (bestStart !== -1) chosen = { start: bestStart, span, top: bestTop };
    }

    // span 1 always has zero waste (nothing to be uneven relative to), so
    // the loop above is guaranteed to find a placement by the time span
    // reaches 1 — this is just satisfying TypeScript.
    if (!chosen) chosen = { start: 0, span: 1, top: colBottoms[0] };

    const { start, span, top } = chosen;
    const width = span * colWidth + (span - 1) * gap;
    const height = width / item.ratio;
    placements.push({ key: item.key, left: start * (colWidth + gap), top, width, height });
    const newBottom = top + height + gap;
    for (let c = start; c < start + span; c++) colBottoms[c] = newBottom;
  }

  return { placements, height: Math.max(0, ...colBottoms) - gap };
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
