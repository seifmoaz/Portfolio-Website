"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type RevealOwnProps<T extends ElementType> = {
  as?: T;
};

type RevealProps<T extends ElementType> = RevealOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RevealOwnProps<T>>;

export default function Reveal<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setInView(true);
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const merged = [className, inView ? "in" : ""].filter(Boolean).join(" ");

  return (
    <Tag ref={ref} data-reveal="" className={merged} {...rest}>
      {children}
    </Tag>
  );
}
