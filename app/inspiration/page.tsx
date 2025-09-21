import { Sidebar } from "@/components/sidebar"
import { ContentDiscoveryHub } from "@/components/content-discovery-hub"

export default function InspirationPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ContentDiscoveryHub />
      </main>
    </div>
  )
}
