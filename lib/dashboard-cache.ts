import "server-only";

import { unstable_cache } from "next/cache";
import { closeMayorDashboardConnection, loadMayorDashboard } from "./live-dashboard";

export async function getFreshMayorDashboard() {
  try {
    return await loadMayorDashboard();
  } finally {
    await closeMayorDashboardConnection();
  }
}

export const getMayorDashboard = unstable_cache(
  getFreshMayorDashboard,
  ["mayor-dashboard-live-v4"],
  { revalidate: 30 },
);
