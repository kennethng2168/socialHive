import { Sidebar } from "@/components/sidebar"
import { VirtualTryOn } from "@/components/virtual-tryon"

export default function VirtualTryOnPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="p-6 space-y-6">
            <VirtualTryOn />
          </div>
        </div>
      </main>
    </div>
  )
}
