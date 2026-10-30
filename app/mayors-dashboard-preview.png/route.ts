import OpenGraphImage from "../../lib/social-preview";

export const dynamic = "force-static";

export function GET() {
  return OpenGraphImage();
}
