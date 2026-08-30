import type { MediaRef } from "./notion";

export function mediaSrc(
  ref: MediaRef | null | undefined,
  options?: { trim?: boolean; width?: number },
): string | null {
  if (!ref) return null;
  const base = `/api/media/${ref.pageId}/${encodeURIComponent(ref.property)}/${ref.index}`;
  // Resizing/trimming only applies to images — video is always served as-is.
  if (ref.isVideo) return base;
  if (options?.trim) return `${base}?trim=1`;
  if (options?.width) return `${base}?w=${options.width}`;
  return base;
}
