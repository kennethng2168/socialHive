import { Sidebar } from "@/components/sidebar"
import { TrendsDashboard } from "@/components/trends-dashboard"

export default function TrendsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <TrendsDashboard />
      </main>
    </div>
  )
}
