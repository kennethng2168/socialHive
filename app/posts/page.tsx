import { Sidebar } from "@/components/sidebar";
import { PostsDashboard } from "@/components/posts-dashboard";

export default function PostsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <PostsDashboard />
      </main>
    </div>
  );
}
