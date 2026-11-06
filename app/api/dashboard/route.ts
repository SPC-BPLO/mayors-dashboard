import { NextResponse } from "next/server";
import { getMayorDashboard } from "@/lib/dashboard-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dashboard = await getMayorDashboard();
    const ageSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(dashboard.updatedAt)) / 1000));
    return NextResponse.json(dashboard, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
        "X-Dashboard-Age-Seconds": String(ageSeconds),
        "X-Dashboard-Freshness": ageSeconds > 60 ? "stale" : "fresh",
        "X-Dashboard-Source": dashboard.source,
        "X-Dashboard-Updated-At": dashboard.updatedAt,
      },
    });
  } catch (error) {
    console.error("Unable to load live Mayor's Dashboard aggregates", error);
    return NextResponse.json(
      { error: "Live departmental data is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
