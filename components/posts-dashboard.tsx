"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Video,
  Eye,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Play,
  Calendar,
} from "lucide-react";

const posts = [
  {
    id: 1,
    title: "Summer Vibes Dance Challenge",
    thumbnail: "/dance-video-thumbnail.png",
    views: "2.3M",
    likes: "145K",
    comments: "8.2K",
    shares: "12K",
    status: "Published",
    publishedAt: "2 hours ago",
    duration: "0:15",
  },
  {
    id: 2,
    title: "Quick Recipe: 5-Minute Pasta",
    thumbnail: "/cooking-video-thumbnail.png",
    views: "890K",
    likes: "67K",
    comments: "3.1K",
    shares: "5.2K",
    status: "Published",
    publishedAt: "1 day ago",
    duration: "0:30",
  },
  {
    id: 3,
    title: "Behind the Scenes: Studio Setup",
    thumbnail: "/studio-setup-video.jpg",
    views: "456K",
    likes: "23K",
    comments: "1.8K",
    shares: "2.1K",
    status: "Draft",
    publishedAt: "Draft",
    duration: "1:20",
  },
  {
    id: 4,
    title: "Behind the Scenes: Studio Setup",
    thumbnail: "/studio-setup-video.jpg",
    views: "456K",
    likes: "23K",
    comments: "1.8K",
    shares: "2.1K",
    status: "Draft",
    publishedAt: "Draft",
    duration: "1:20",
  },
];

export function PostsDashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
            <p className="text-sm text-gray-600">
              Manage your published and draft content
            </p>
          </div>
          <Link href="/posts/create">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Video className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <div className="border-b border-gray-200 px-6 py-2 flex-shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4 pb-8">
                {posts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="relative">
                          <img
                            src={post.thumbnail || "/placeholder.svg"}
                            alt={post.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                            {post.duration}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {post.publishedAt}
                                </div>
                                <Badge
                                  variant={
                                    post.status === "Published"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    post.status === "Published"
                                      ? "bg-green-100 text-green-800"
                                      : ""
                                  }
                                >
                                  {post.status}
                                </Badge>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  {post.comments}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Share className="h-4 w-4" />
                                  {post.shares}
                                </div>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="published" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">
                  Published posts will appear here
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="drafts" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">Draft posts will appear here</p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scheduled" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">
                  Scheduled posts will appear here
                </p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
