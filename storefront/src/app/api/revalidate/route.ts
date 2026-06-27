import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * ISR revalidation endpoint.
 *
 * Called by Medusa webhooks (or manually) to invalidate Next.js
 * Incremental Static Regeneration cache by tag.
 *
 * Usage:
 *   POST /api/revalidate
 *   Headers: { "x-revalidate-secret": "<secret>" }
 *   Body: { "tag": "products" }
 *
 * Cache tags used in this project:
 *   - "products"     → Product list pages (catalog)
 *   - "product:{id}" → Individual PDP pages
 *   - "categories"   → Category pages
 */
export async function POST(request: NextRequest) {
  // Validate secret to prevent unauthorized purges
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized — invalid or missing secret" },
      { status: 401 },
    );
  }

  let body: { tag?: string; tags?: string[] };

  try {
    body = (await request.json()) as { tag?: string; tags?: string[] };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const tags = body.tags ?? (body.tag ? [body.tag] : []);

  if (tags.length === 0) {
    return NextResponse.json(
      { error: 'Missing "tag" or "tags" in request body' },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({
    revalidated: true,
    tags,
    timestamp: new Date().toISOString(),
  });
}
