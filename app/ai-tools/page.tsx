import { Sidebar } from "@/components/sidebar"
import { AIToolsStudio } from "@/components/ai-tools-studio"

export default function AIToolsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <AIToolsStudio />
      </main>
    </div>
  )
}
