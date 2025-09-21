import { Sidebar } from "@/components/sidebar"
import { WorkflowEditor } from "@/components/workflow-editor"

export default function WorkflowPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <WorkflowEditor />
      </main>
    </div>
  )
}
