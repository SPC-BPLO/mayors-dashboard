import { Dashboard } from "@/components/Dashboard";
import { getMayorDashboard } from "@/lib/dashboard-cache";
import type { MayorDashboardResponse } from "@/lib/dashboard-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialData: MayorDashboardResponse | undefined;
  try {
    initialData = await getMayorDashboard();
  } catch (error) {
    console.error("Unable to preload live Mayor's Dashboard data", error);
  }

  return <Dashboard initialData={initialData} />;
}
