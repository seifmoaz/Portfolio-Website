import type { MediaRef } from "./notion";

export function mediaSrc(ref: MediaRef | null | undefined): string | null {
  if (!ref) return null;
  return `/api/media/${ref.pageId}/${encodeURIComponent(ref.property)}/${ref.index}`;
}
