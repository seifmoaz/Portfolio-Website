"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";

// Client deliverable showcase videos: played with sound and controls, not
// autoplay/muted/looped like the decorative background clips elsewhere on
// the site. These need real adaptive-bitrate streaming so a visitor on a
// slow connection gets a lower-bitrate rendition automatically instead of
// stalling on a single fixed-quality file.
//
// Native <video> only understands HLS (.m3u8) in Safari. Every other
// browser needs hls.js to demux the stream into something the <video>
// element can play, so it's loaded dynamically (only when this component
// is actually used) rather than bundled sitewide.
export default function HlsVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari (desktop + iOS) plays HLS natively — no library needed.
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let hls: Hls | null = null;
    let cancelled = false;

    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (!Hls.isSupported()) {
        setErrored(true);
        return;
      }
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setErrored(true);
      });
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [src]);

  if (errored) {
    return (
      <p className="empty-state">
        This video couldn&apos;t be loaded in your browser. Try refreshing, or open it directly:{" "}
        <a href={src} target="_blank" rel="noopener">
          view video
        </a>
        .
      </p>
    );
  }

  return <video ref={videoRef} className={className} controls playsInline poster={poster} />;
}
