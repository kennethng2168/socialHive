"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Eye, Heart, MessageCircle, Share, MoreHorizontal, Calendar, Clock } from "lucide-react"

const recentPosts = [
  {
    id: 1,
    title: "Morning Routine That Changed My Life",
    thumbnail: "/morning-routine-lifestyle.jpg",
    views: "1.2M",
    likes: "89K",
    comments: "2.1K",
    shares: "456",
    uploadDate: "2 days ago",
    status: "published",
  },
  {
    id: 2,
    title: "Quick 5-Minute Breakfast Ideas",
    thumbnail: "/breakfast-food-cooking.jpg",
    views: "890K",
    likes: "67K",
    comments: "1.8K",
    shares: "321",
    uploadDate: "4 days ago",
    status: "published",
  },
  {
    id: 3,
    title: "Study Tips for Better Focus",
    thumbnail: "/study-desk-productivity.jpg",
    views: "654K",
    likes: "45K",
    comments: "987",
    shares: "234",
    uploadDate: "1 week ago",
    status: "published",
  },
  {
    id: 4,
    title: "Weekend Workout Challenge",
    thumbnail: "/workout-fitness-exercise.jpg",
    views: "0",
    likes: "0",
    comments: "0",
    shares: "0",
    uploadDate: "Scheduled for tomorrow",
    status: "scheduled",
  },
]

export function ContentGrid() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Manage and track your latest content</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All Posts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentPosts.map((post) => (
            <div
              key={post.id}
              className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
            >
              <div className="relative aspect-square">
                <img
                  src={post.thumbnail || "/placeholder.svg"}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                    {post.status === "published" ? "Live" : "Scheduled"}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-medium text-sm line-clamp-2 mb-2">{post.title}</h3>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  {post.uploadDate}
                </div>

                {post.status === "published" ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-3 w-3" />
                      <span>{post.shares}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
