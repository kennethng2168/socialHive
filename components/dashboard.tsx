"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Clock,
  Sparkles,
  Target,
  Zap,
  BarChart3,
  Calendar,
  ArrowUpRight,
  Play,
} from "lucide-react"
import { AnalyticsChart } from "@/components/analytics-chart"
import { ContentGrid } from "@/components/content-grid"
import { AIInsights } from "@/components/ai-insights"

export function Dashboard() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">Welcome back, Creator</h1>
          <p className="text-muted-foreground">Here's what's happening with your content today</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 days
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Suggestions
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +20.1% from last week
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-1 to-chart-2" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.4% from last week
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-2 to-chart-3" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +15.3% from last week
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-3 to-chart-4" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5.2% from last week
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-chart-4 to-chart-5" />
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analytics Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>Your content performance over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart />
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <div>
          <AIInsights />
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Top Performing Content
            </CardTitle>
            <CardDescription>Your best videos from the past week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Morning Routine Hack",
                views: "1.2M",
                engagement: "12.4%",
                thumbnail: "/diverse-morning-routine.png",
              },
              {
                title: "Quick Recipe Tutorial",
                views: "890K",
                engagement: "9.8%",
                thumbnail: "/cooking-recipe.png",
              },
              {
                title: "Productivity Tips",
                views: "654K",
                engagement: "8.2%",
                thumbnail: "/productivity-workspace.png",
              },
            ].map((video, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                <div className="relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {video.engagement}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Streamline your workflow with these shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Caption
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Find Trending Hashtags
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Analyze Audience
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Bulk Reply to Comments
            </Button>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Creator Goals</span>
                <Badge variant="secondary">3/5</Badge>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Monthly Views</span>
                    <span>2.4M / 3M</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Follower Growth</span>
                    <span>1.2K / 2K</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <ContentGrid />
    </div>
  )
}
