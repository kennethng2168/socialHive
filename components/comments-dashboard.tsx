"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Reply,
  Flag,
  MoreHorizontal,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const comments = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      username: "@sarahj_dance",
      avatar: "/diverse-user-avatars.png",
    },
    content: "This dance is absolutely amazing! Can you do a tutorial? 🔥",
    timestamp: "2 hours ago",
    likes: 24,
    replies: 3,
    postTitle: "Summer Vibes Dance Challenge",
    status: "approved",
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      username: "@mikecooks",
      avatar: "/chef-avatar.png",
    },
    content: "The pasta looks delicious! What type of sauce did you use?",
    timestamp: "5 hours ago",
    likes: 12,
    replies: 1,
    postTitle: "Quick Recipe: 5-Minute Pasta",
    status: "approved",
  },
  {
    id: 3,
    user: {
      name: "Anonymous User",
      username: "@user123",
      avatar: "/anonymous-avatar.png",
    },
    content: "This is spam content that needs moderation",
    timestamp: "1 day ago",
    likes: 0,
    replies: 0,
    postTitle: "Behind the Scenes: Studio Setup",
    status: "pending",
  },
];

export function CommentsDashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
            <p className="text-sm text-gray-600">
              Manage and moderate your community interactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search comments..." className="pl-9 w-64" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <div className="border-b border-gray-200 px-6 py-2 flex-shrink-0">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All Comments</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4 pb-8">
                {comments.map((comment) => (
                  <Card
                    key={comment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={comment.user.avatar || "/placeholder.svg"}
                            alt={comment.user.name}
                          />
                          <AvatarFallback>
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {comment.user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {comment.user.username}
                            </span>
                            <span className="text-sm text-gray-400">•</span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {comment.timestamp}
                            </div>
                            <Badge
                              variant={
                                comment.status === "approved"
                                  ? "default"
                                  : comment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                comment.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : comment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {comment.status}
                            </Badge>
                          </div>

                          <p className="text-gray-900 mb-2">
                            {comment.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="text-xs text-gray-500">
                                On: {comment.postTitle}
                              </span>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {comment.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Reply className="h-4 w-4" />
                                {comment.replies}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Reply className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Flag className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="approved" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">
                  Approved comments will appear here
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pending" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">
                  Comments awaiting moderation will appear here
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="flagged" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <p className="text-gray-600">Flagged comments will appear here</p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
