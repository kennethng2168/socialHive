import { Sidebar } from "@/components/sidebar"
import { VirtualTryOn } from "@/components/virtual-tryon"

export default function VirtualTryOnPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="p-6 space-y-6">
            <VirtualTryOn />
          </div>
        </div>
      </main>
    </div>
  )
}
