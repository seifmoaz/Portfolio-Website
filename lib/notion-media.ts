import type { MediaRef } from "./notion";

export function mediaSrc(
  ref: MediaRef | null | undefined,
  options?: { trim?: boolean },
): string | null {
  if (!ref) return null;
  const base = `/api/media/${ref.pageId}/${encodeURIComponent(ref.property)}/${ref.index}`;
  return options?.trim ? `${base}?trim=1` : base;
}
