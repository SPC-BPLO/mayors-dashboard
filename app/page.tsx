import { Dashboard } from "@/components/Dashboard";
import { getMayorDashboard } from "@/lib/dashboard-cache";
import type { MayorDashboardResponse } from "@/lib/dashboard-types";

// Keep the HTML shell publicly cacheable for link-preview crawlers while
// refreshing the server-rendered dashboard snapshot every 30 seconds.
export const revalidate = 30;

export default async function Home() {
  let initialData: MayorDashboardResponse | undefined;
  try {
    initialData = await getMayorDashboard();
  } catch (error) {
    console.error("Unable to preload live Mayor's Dashboard data", error);
  }

  return <Dashboard initialData={initialData} />;
}
