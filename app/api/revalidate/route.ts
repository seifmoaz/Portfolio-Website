import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Not wired to anything by default — the site refreshes automatically via
// ISR (see `revalidate` exports on each page). This exists so a future
// Notion Business-plan automation, Zapier/Make step, or a manual call can
// force an immediate refresh of one path instead of waiting for the next
// scheduled regeneration.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const { searchParams } = new URL(request.url);
  const provided = searchParams.get("secret");

  if (!secret || !provided || !safeEqual(provided, secret)) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const path = searchParams.get("path") || "/";
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
