import { Dashboard } from "@/components/Dashboard";
import { getMayorDashboard } from "@/lib/dashboard-cache";

// Render a recent live snapshot into the first response, then let the client
// refresh it in the background after hydration.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  try {
    const initialData = await getMayorDashboard();
    return <Dashboard initialData={initialData} />;
  } catch (error) {
    // Keep the interface available if the database is temporarily unavailable;
    // the client will retry through /api/dashboard after hydration.
    console.error("Unable to render initial Mayor's Dashboard data", error);
    return <Dashboard />;
  }
}
