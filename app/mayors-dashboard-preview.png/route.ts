import OpenGraphImage from "../../lib/social-preview";
import { Buffer } from "node:buffer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const sealResponse = await fetch(new URL("/san-pablo-city-seal.png?v=1", request.url), {
    cache: "force-cache",
  });
  if (!sealResponse.ok) {
    return new Response("Preview artwork is unavailable.", { status: 503 });
  }

  const sealBytes = await sealResponse.arrayBuffer();
  const sealDataUrl = `data:image/png;base64,${Buffer.from(sealBytes).toString("base64")}`;
  return OpenGraphImage(sealDataUrl);
}
