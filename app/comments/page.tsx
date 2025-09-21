import { Sidebar } from "@/components/sidebar"
import { CommentsDashboard } from "@/components/comments-dashboard"

export default function CommentsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <CommentsDashboard />
      </main>
    </div>
  )
}
