import sharp from "sharp";
import { getMediaFileUrl } from "@/lib/notion";

export const dynamic = "force-dynamic";

// Notion's signed file URLs stay valid for roughly an hour; cache well
// under that so this proxy re-checks before a link can go stale.
const CACHE_CONTROL = "public, max-age=1800";
const MAX_WIDTH = 2400; // safety cap regardless of what a caller asks for

// Logos are uploaded with wildly inconsistent padding baked into the file
// (some crop tight to the mark, some leave a lot of empty canvas around
// it), so a uniform CSS height alone still makes them look mismatched.
// `?trim=1` fetches the actual bytes and trims that padding away before
// serving, so every logo's visible mark fills the same box.
async function trimmedImageResponse(url: string): Promise<Response> {
  const imageRes = await fetch(url);
  if (!imageRes.ok) return new Response("Not found", { status: 404 });
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const processed = await sharp(buffer)
    .trim()
    .resize({ height: 240, fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return new Response(processed, {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": CACHE_CONTROL },
  });
}

// Work/Photography photos come straight from Notion at whatever resolution
// they were uploaded at — often full camera/export resolution (many MB).
// `?w=<px>` fetches the bytes, downsizes to what's actually needed on
// screen, and re-encodes as WebP, cutting typical file size by 80%+
// without a visible quality difference at display size.
async function resizedImageResponse(url: string, width: number): Promise<Response> {
  const imageRes = await fetch(url);
  if (!imageRes.ok) return new Response("Not found", { status: 404 });
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const processed = await sharp(buffer)
    .resize({ width: Math.min(width, MAX_WIDTH), fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return new Response(processed, {
    status: 200,
    headers: { "Content-Type": "image/webp", "Cache-Control": CACHE_CONTROL },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string[] }> },
) {
  const { ref } = await params;
  const [pageId, property, indexRaw] = ref ?? [];
  const index = Number(indexRaw);

  if (!pageId || !property || !Number.isInteger(index)) {
    return new Response("Not found", { status: 404 });
  }

  const url = await getMediaFileUrl(pageId, decodeURIComponent(property), index);
  if (!url) {
    return new Response("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const trim = searchParams.get("trim") === "1";
  const width = Number(searchParams.get("w"));

  try {
    if (trim) return await trimmedImageResponse(url);
    if (Number.isFinite(width) && width > 0) return await resizedImageResponse(url, width);
  } catch (err) {
    console.error(`Media processing failed for ${pageId}/${property}/${index}:`, err);
    // Fall through to the plain redirect below rather than breaking the image entirely.
  }

  return new Response(null, {
    status: 307,
    headers: { Location: url, "Cache-Control": CACHE_CONTROL },
  });
}
