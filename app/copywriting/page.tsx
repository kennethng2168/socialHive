import { Sidebar } from "@/components/sidebar"
import { CopywritingStudio } from "@/components/copywriting-studio"

export default function CopywritingPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <CopywritingStudio />
      </main>
    </div>
  )
}