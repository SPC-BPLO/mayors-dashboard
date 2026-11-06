import "server-only";

import { unstable_cache } from "next/cache";
import { loadMayorDashboard } from "./live-dashboard";

export async function getFreshMayorDashboard() {
  return loadMayorDashboard();
}

export const getMayorDashboard = unstable_cache(
  getFreshMayorDashboard,
  ["mayor-dashboard-live-v5"],
  { revalidate: 15 },
);
