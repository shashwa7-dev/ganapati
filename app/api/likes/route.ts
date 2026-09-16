import { artworks } from "@/lib/collection";
import { parseToggle } from "@/lib/likes-api";
import { getStore } from "@/lib/likes-store";

const ids = new Set(artworks.map((artwork) => artwork.id));
const NO_STORE = { "cache-control": "no-store" };

export async function GET() {
  try {
    const counts = await getStore().all();
    return Response.json({ counts }, { headers: NO_STORE });
  } catch {
    return Response.json({ counts: {} }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const toggle = parseToggle(body, (id) => ids.has(id));
  if (!toggle) {
    return Response.json({ error: "Expected { id: <work id>, delta: 1 | -1 }" }, { status: 400 });
  }
  try {
    const count = await getStore().bump(toggle.id, toggle.delta);
    return Response.json({ id: toggle.id, count }, { headers: NO_STORE });
  } catch {
    return Response.json({ error: "Likes store unavailable" }, { status: 503 });
  }
}
