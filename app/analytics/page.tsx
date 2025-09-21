import { Sidebar } from "@/components/sidebar";
import { AnalyticsWordCloud } from "@/components/word-cloud";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <AnalyticsWordCloud />
        {/* <AnalyticsDashboard /> */}
      </main>
    </div>
  );
}
