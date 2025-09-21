import { Sidebar } from "@/components/sidebar"
import { CreatorToolsHub } from "@/components/creator-tools-hub"

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <CreatorToolsHub />
      </main>
    </div>
  )
}
