import OpenGraphImage from "../opengraph-image";

export const dynamic = "force-static";

export function GET() {
  return OpenGraphImage();
}
