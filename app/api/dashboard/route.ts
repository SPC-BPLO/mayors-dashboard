import { NextResponse } from "next/server";
import { getMayorDashboard } from "@/lib/dashboard-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dashboard = await getMayorDashboard();
    return NextResponse.json(dashboard, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Unable to load live Mayor's Dashboard aggregates", error);
    return NextResponse.json(
      { error: "Live departmental data is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
