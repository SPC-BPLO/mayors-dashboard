import "server-only";

import { unstable_cache } from "next/cache";
import { closeMayorDashboardConnection, loadMayorDashboard } from "./live-dashboard";

export const getMayorDashboard = unstable_cache(
  async () => {
    try {
      return await loadMayorDashboard();
    } finally {
      await closeMayorDashboardConnection();
    }
  },
  ["mayor-dashboard-live-v3"],
  { revalidate: 30 },
);
