import { Dashboard } from "@/components/Dashboard";

// Keep the HTML shell publicly cacheable for link-preview crawlers while
// refreshing the server-rendered dashboard snapshot every 30 seconds.
export const revalidate = 15;

export default function Home() {
  return <Dashboard />;
}
