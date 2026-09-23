"use client";

import { useEffect } from "react";

// Blocks the two casual ways to grab a full-size photo off the page —
// right-click "Save Image As" and dragging it out to the desktop — without
// touching how anything looks or loads. This is a deterrent, not real
// protection: the browser still has to download the exact same file it
// displays, so anyone who opens dev tools and reads the network requests
// can still get it. There's no client-side trick that changes that; only
// blocking the one-click paths is actually achievable here.
export default function ImageProtection() {
  useEffect(() => {
    const isImage = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.tagName === "IMG";

    const onContextMenu = (e: MouseEvent) => {
      if (isImage(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (isImage(e.target)) e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
