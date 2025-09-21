import { Sidebar } from "@/components/sidebar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <AnalyticsDashboard />
      </main>
    </div>
  )
}
