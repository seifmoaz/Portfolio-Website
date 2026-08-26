"use client";

import { useRef, useState } from "react";

type Testimonial = { who: string; quote: string };

const TESTIMONIALS: Testimonial[] = [
  { who: "Brand Name", quote: "Real testimonial goes here once it lands. Promise it will be a good one." },
  { who: "Brand Name", quote: "Real testimonial goes here once it lands. Promise it will be a good one." },
  { who: "Brand Name", quote: "Real testimonial goes here once it lands. Promise it will be a good one." },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef(0);

  const goTo = (targetRaw: number, dir: 1 | -1) => {
    const target = (targetRaw + TESTIMONIALS.length) % TESTIMONIALS.length;
    if (target === current) return;
    setDirection(dir);
    setCurrent(target);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) goTo(current + 1, 1);
      else goTo(current - 1, -1);
    }
  };

  return (
    <div className="t-video-block" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <video autoPlay muted loop playsInline poster="https://picsum.photos/seed/t-video-01/1600/500">
        <source
          src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
      </video>
      <div className="t-slides">
        {TESTIMONIALS.map((t, idx) => {
          let state: "active" | "prev" | "next" | "" = "";
          if (idx === current) state = "active";
          else if (direction === 1 ? idx === (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length : idx === (current + 1) % TESTIMONIALS.length) {
            state = direction === 1 ? "prev" : "next";
          }
          return (
            <div key={idx} className={`t-slide${state ? ` ${state}` : ""}`}>
              <div className="t-signature">
                <span className="who">{t.who}</span>
              </div>
              <p className="t-quote">{t.quote}</p>
            </div>
          );
        })}
      </div>
      <button className="t-arrow prev" aria-label="Previous testimonial" onClick={() => goTo(current - 1, -1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button className="t-arrow next" aria-label="Next testimonial" onClick={() => goTo(current + 1, 1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div className="t-nav">
        {TESTIMONIALS.map((_, idx) => (
          <button
            key={idx}
            className={`t-dot${idx === current ? " active" : ""}`}
            aria-label={`Testimonial ${idx + 1}`}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
          />
        ))}
      </div>
    </div>
  );
}
