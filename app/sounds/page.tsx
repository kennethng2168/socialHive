import { Sidebar } from "@/components/sidebar"
import { SoundsLibrary } from "@/components/sounds-library"

export default function SoundsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <SoundsLibrary />
      </main>
    </div>
  )
}
