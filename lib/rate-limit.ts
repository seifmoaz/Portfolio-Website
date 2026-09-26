// In-memory fixed-window rate limiter. Each serverless instance keeps its
// own counters, so this is a soft cap rather than a hard global guarantee —
// but for this site's traffic it's enough to stop casual spam/abuse scripts
// without pulling in an external store (Redis/Upstash) for a portfolio site.
const hits = new Map<string, { count: number; resetAt: number }>();

// Bound memory: drop expired entries once the map gets large instead of
// letting it grow forever between deploys.
function sweep(now: number) {
  if (hits.size < 5000) return;
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0].trim() || "unknown";
}
