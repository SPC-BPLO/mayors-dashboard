import OpenGraphImage from "../../lib/social-preview";

export const dynamic = "force-dynamic";

export function GET() {
  return OpenGraphImage();
}
