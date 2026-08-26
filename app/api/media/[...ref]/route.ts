import { getMediaFileUrl } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

  return new Response(null, {
    status: 307,
    headers: {
      Location: url,
      // Notion's signed file URLs stay valid for roughly an hour; cache well
      // under that so this proxy re-checks before a link can go stale.
      "Cache-Control": "public, max-age=1800",
    },
  });
}
