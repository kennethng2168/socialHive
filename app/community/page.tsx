import { Sidebar } from "@/components/sidebar"
import { CommunityHub } from "@/components/community-hub"

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64">
        <CommunityHub />
      </main>
    </div>
  )
}
