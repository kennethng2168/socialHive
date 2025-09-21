import { Sidebar } from "@/components/sidebar"
import { AIInspirationHub } from "@/components/ai-inspiration-hub"

export default function AIInspirationPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <AIInspirationHub />
      </main>
    </div>
  )
}
