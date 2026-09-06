export type Placement = { key: string; left: number; top: number; width: number; height: number };

export function spanForRatio(ratio: number, numColumns: number): number {
  if (ratio >= 1.9) return Math.min(3, numColumns);
  if (ratio >= 1.2) return Math.min(2, numColumns);
  return 1;
}

// True skyline/masonry placement: each item goes at the lowest possible
// position for its column-span, and only the columns it actually occupies
// are pushed down. Unlike CSS Grid's row-based auto-placement (even with
// grid-auto-flow: dense, which is a greedy row scan, not a real 2D packer),
// this can't leave an unfilled hole — every column is a contiguous stack.
//
// The one way a skyline packer like this *can* still strand a gap: a
// multi-column item anchors to the tallest column it spans, leaving dead
// space under any shorter column it also covers. So a span is only used
// when the columns it would cover are already within GAP_TOLERANCE of each
// other — otherwise it falls back to a narrower span (always down to 1,
// which spans a single column and can never create waste).
const GAP_TOLERANCE = 24; // px — roughly one gap's worth of "close enough"

export function layoutMasonry(
  items: { key: string; ratio: number }[],
  numColumns: number,
  containerWidth: number,
  gap: number,
): { placements: Placement[]; height: number } {
  const colWidth = (containerWidth - (numColumns - 1) * gap) / numColumns;
  const colBottoms = new Array(numColumns).fill(0);
  const placements: Placement[] = [];

  for (const item of items) {
    const idealSpan = spanForRatio(item.ratio, numColumns);
    let chosen: { start: number; span: number; top: number } | null = null;

    for (let span = idealSpan; span >= 1 && !chosen; span--) {
      let bestStart = -1;
      let bestTop = Infinity;
      for (let start = 0; start <= numColumns - span; start++) {
        const slice = colBottoms.slice(start, start + span);
        const top = Math.max(...slice);
        const wasted = slice.reduce((sum, c) => sum + (top - c), 0);
        if (wasted <= GAP_TOLERANCE && top < bestTop) {
          bestTop = top;
          bestStart = start;
        }
      }
      if (bestStart !== -1) chosen = { start: bestStart, span, top: bestTop };
    }

    // span 1 always has zero waste (nothing to be uneven relative to), so
    // the loop above is guaranteed to find a placement by the time span
    // reaches 1 — this is just satisfying TypeScript.
    if (!chosen) chosen = { start: 0, span: 1, top: colBottoms[0] };

    const { start, span, top } = chosen;
    const width = span * colWidth + (span - 1) * gap;
    const height = width / item.ratio;
    placements.push({ key: item.key, left: start * (colWidth + gap), top, width, height });
    const newBottom = top + height + gap;
    for (let c = start; c < start + span; c++) colBottoms[c] = newBottom;
  }

  return { placements, height: Math.max(0, ...colBottoms) - gap };
}
