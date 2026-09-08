"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import HlsVideo from "@/components/HlsVideo";
import { layoutMasonry, type Placement } from "@/lib/masonry";
import type { ShowcaseVideo } from "@/lib/notion";

const DEFAULT_RATIO = 16 / 9; // guess used before a video's real aspect ratio is known

// Aspect ratio primarily comes from `video.ratio` (read server-side from the
// HLS master playlist — see getShowcaseVideos in lib/notion.ts), not from
// the client `loadedmetadata` event: mobile Safari defers loading a
// <video>'s network data until the user interacts with it, so a layout that
// depended on the client alone would sit stuck at a fallback shape
// indefinitely on phones. `loadedmetadata` still self-corrects the rare
// case the server-side lookup failed. Placing every item with an explicit
// pixel width/height (rather than relying on CSS auto-sizing) means the
// masonry never depends on a frame having decoded either.
//
// Two columns even on a phone-width screen so a landscape video (which
// spans both, per spanForRatio) reads as one full-width row while portrait
// videos sit two across, rather than every video stacking one per row.
function columnsForWidth(width: number): number {
  if (width <= 1100) return 2;
  return 3;
}

export default function ShowcaseVideoGrid({ videos }: { videos: ShowcaseVideo[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [containerWidth, setContainerWidth] = useState(0);

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

  const recordRatio = (key: string, ratio: number) => {
    if (!ratio || !Number.isFinite(ratio)) return;
    setRatios((prev) => (prev[key] ? prev : { ...prev, [key]: ratio }));
  };

  const numColumns = containerWidth > 0 ? columnsForWidth(containerWidth) : 3;
  const gap = containerWidth > 0 && containerWidth <= 700 ? 16 : 32;

  const { placements, height } = useMemo(() => {
    if (!containerWidth) return { placements: [] as Placement[], height: 0 };
    const withRatios = videos.map((v) => ({ key: v.url, ratio: ratios[v.url] ?? v.ratio ?? DEFAULT_RATIO }));
    // With only 2-3 columns (vs. the photo grid's 6), a landscape video
    // squeezed into one column reads as a mistake, not a packing nicety —
    // always give it the full row its ratio calls for.
    return layoutMasonry(withRatios, numColumns, containerWidth, gap, Infinity);
  }, [videos, ratios, numColumns, containerWidth, gap]);

  const placementByKey = useMemo(() => {
    const map = new Map<string, Placement>();
    placements.forEach((p) => map.set(p.key, p));
    return map;
  }, [placements]);

  return (
    <div className="showcase-videos" ref={containerRef} style={{ position: "relative", height }}>
      {videos.map((video) => {
        const p = placementByKey.get(video.url);
        const style: CSSProperties = p
          ? { position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height }
          : { position: "absolute", visibility: "hidden" };
        return (
          <div className="showcase-video" style={style} key={video.url}>
            <HlsVideo
              src={video.url}
              poster={video.poster ?? undefined}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.videoWidth && v.videoHeight) recordRatio(video.url, v.videoWidth / v.videoHeight);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
