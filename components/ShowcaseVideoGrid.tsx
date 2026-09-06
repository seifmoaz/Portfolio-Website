"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import HlsVideo from "@/components/HlsVideo";
import { layoutMasonry, type Placement } from "@/lib/masonry";
import type { ShowcaseVideo } from "@/lib/notion";

const DEFAULT_RATIO = 16 / 9; // guess used before a video's real aspect ratio is known

// Showcase videos read their intrinsic size from `loadedmetadata` rather
// than the CSS auto-sizing that .pin-item's <img>/<video> can rely on: a
// hls.js-driven <video> reports videoWidth/videoHeight immediately once
// metadata parses, well before the browser has decoded and painted a frame,
// and some browsers don't apply that size to layout (via width:auto/
// height:auto) until a frame actually renders. Placing every item with an
// explicit pixel width/height — as this masonry layout does — sidesteps
// that lag entirely.
function columnsForWidth(width: number): number {
  if (width <= 700) return 1;
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
  const gap = numColumns <= 1 ? 24 : 32;

  const { placements, height } = useMemo(() => {
    if (!containerWidth) return { placements: [] as Placement[], height: 0 };
    const withRatios = videos.map((v) => ({ key: v.url, ratio: ratios[v.url] ?? DEFAULT_RATIO }));
    return layoutMasonry(withRatios, numColumns, containerWidth, gap);
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
