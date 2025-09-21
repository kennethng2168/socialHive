import { Sidebar } from "@/components/sidebar";
import { CreatePost } from "@/components/create-post";

export default function CreatePostPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <CreatePost />
      </main>
    </div>
  );
}
