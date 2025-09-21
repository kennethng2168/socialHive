"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Heart,
  MessageCircle,
  Share,
  Clock,
  TrendingUp,
  Play,
  Bookmark,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react"

interface TrendingContentProps {
  searchQuery: string
  category: string
  region: string
}

const trendingVideos = [
  {
    id: 1,
    title: "Morning Routine That Changed My Life",
    creator: "@wellness_guru",
    thumbnail: "/morning-routine-lifestyle.jpg",
    views: "2.4M",
    likes: "189K",
    comments: "12.3K",
    shares: "8.9K",
    duration: "0:45",
    trend: "up",
    category: "lifestyle",
    hashtags: ["#MorningRoutine", "#Wellness", "#ProductivityHacks"],
    description:
      "Transform your mornings with these 5 simple habits that will boost your energy and productivity all day long!",
  },
  {
    id: 2,
    title: "Quick 5-Minute Breakfast Ideas",
    creator: "@healthy_eats",
    thumbnail: "/breakfast-food-cooking.jpg",
    views: "1.8M",
    likes: "145K",
    comments: "9.2K",
    shares: "6.7K",
    duration: "0:32",
    trend: "up",
    category: "lifestyle",
    hashtags: ["#HealthyEating", "#QuickRecipes", "#Breakfast"],
    description:
      "Delicious and nutritious breakfast recipes you can make in under 5 minutes - perfect for busy mornings!",
  },
  {
    id: 3,
    title: "Study Tips That Actually Work",
    creator: "@study_smart",
    thumbnail: "/study-desk-productivity.jpg",
    views: "3.1M",
    likes: "234K",
    comments: "18.5K",
    shares: "12.1K",
    duration: "1:02",
    trend: "stable",
    category: "education",
    hashtags: ["#StudyTips", "#Productivity", "#StudentLife"],
    description: "Evidence-based study techniques that will help you learn faster and retain more information.",
  },
  {
    id: 4,
    title: "10-Minute Home Workout",
    creator: "@fit_life",
    thumbnail: "/workout-fitness-exercise.jpg",
    views: "1.5M",
    likes: "98K",
    comments: "7.8K",
    shares: "5.2K",
    duration: "0:58",
    trend: "up",
    category: "lifestyle",
    hashtags: ["#HomeWorkout", "#Fitness", "#HealthyLifestyle"],
    description: "No equipment needed! Get your heart pumping with this effective 10-minute workout routine.",
  },
]

export function TrendingContent({ searchQuery, category, region }: TrendingContentProps) {
  const [savedItems, setSavedItems] = useState<number[]>([])

  const toggleSave = (id: number) => {
    setSavedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const filteredVideos = trendingVideos.filter((video) => {
    const matchesSearch =
      searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.hashtags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = category === "all" || video.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Trending Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">Trending Topics</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Views</p>
                <p className="text-2xl font-bold">12.8M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/10 rounded-lg">
                <Heart className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium">Engagement</p>
                <p className="text-2xl font-bold">8.9%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Score</p>
                <p className="text-2xl font-bold">9.2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-[9/16] overflow-hidden">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                  <Play className="h-4 w-4 mr-1" />
                  Watch
                </Button>
              </div>

              {/* Video Info Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <Badge
                  variant={video.trend === "up" ? "default" : "secondary"}
                  className={video.trend === "up" ? "bg-green-500 text-white" : ""}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {video.trend === "up" ? "Trending" : "Stable"}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white p-2"
                    onClick={() => toggleSave(video.id)}
                  >
                    <Bookmark className={`h-3 w-3 ${savedItems.includes(video.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="bg-black/70 text-white text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h3>
                  <p className="text-xs text-slate-600">{video.creator}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{video.description}</p>

                <div className="flex flex-wrap gap-1">
                  {video.hashtags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {video.hashtags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{video.hashtags.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{video.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{video.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{video.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share className="h-3 w-3" />
                    <span>{video.shares}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                    <Copy className="h-3 w-3 mr-1" />
                    Adapt
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No trending content found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search terms or filters to discover more content
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
