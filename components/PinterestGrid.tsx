"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PinItem = {
  key: string;
  src: string;
  alt: string;
  isVideo?: boolean;
};

const ROW_UNIT = 6; // px — must match .pin-grid's grid-auto-rows in globals.css
const DEFAULT_RATIO = 0.8; // portrait-ish guess used before an item's real size is known

function spanForRatio(ratio: number, maxCols: number): number {
  if (ratio >= 1.9) return Math.min(3, maxCols);
  if (ratio >= 1.2) return Math.min(2, maxCols);
  return 1;
}

export default function PinterestGrid({ items }: { items: PinItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState<{ colWidth: number; gap: number; count: number } | null>(null);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const cols = cs.gridTemplateColumns
      .split(" ")
      .map((v) => parseFloat(v))
      .filter((n) => !Number.isNaN(n));
    const gap = parseFloat(cs.columnGap || "0") || 0;
    if (cols.length > 0) setMetrics({ colWidth: cols[0], gap, count: cols.length });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const recordRatio = (key: string, ratio: number) => {
    if (!ratio || !Number.isFinite(ratio)) return;
    setRatios((prev) => (prev[key] ? prev : { ...prev, [key]: ratio }));
  };

  return (
    <div className="pin-grid" ref={containerRef}>
      {items.map((item) => {
        const ratio = ratios[item.key] ?? DEFAULT_RATIO;
        const colSpan = metrics ? spanForRatio(ratio, metrics.count) : 1;
        let rowSpan = 34;
        if (metrics) {
          const itemWidth = colSpan * metrics.colWidth + (colSpan - 1) * metrics.gap;
          const itemHeight = itemWidth / ratio;
          rowSpan = Math.max(1, Math.ceil((itemHeight + metrics.gap) / (ROW_UNIT + metrics.gap)));
        }
        return (
          <div key={item.key} className="pin-item" style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}>
            {item.isVideo ? (
              <video
                muted
                loop
                playsInline
                autoPlay
                ref={(v) => {
                  if (v && v.readyState >= 1 && v.videoWidth && v.videoHeight) {
                    recordRatio(item.key, v.videoWidth / v.videoHeight);
                  }
                }}
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
