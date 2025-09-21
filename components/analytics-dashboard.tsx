"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Eye, Heart, MessageCircle, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const viewsData = [
  { date: "Jan 1", views: 1200, likes: 89, comments: 23 },
  { date: "Jan 2", views: 1890, likes: 134, comments: 45 },
  { date: "Jan 3", views: 2100, likes: 156, comments: 67 },
  { date: "Jan 4", views: 1750, likes: 123, comments: 34 },
  { date: "Jan 5", views: 2400, likes: 189, comments: 78 },
  { date: "Jan 6", views: 2800, likes: 234, comments: 89 },
  { date: "Jan 7", views: 3200, likes: 267, comments: 102 },
];

const topVideos = [
  { title: "Morning Routine Tips", views: "2.3M", engagement: "8.4%" },
  { title: "Quick Recipe Tutorial", views: "1.8M", engagement: "7.2%" },
  { title: "Workout Challenge", views: "1.5M", engagement: "9.1%" },
  { title: "Tech Review", views: "1.2M", engagement: "6.8%" },
];

export function AnalyticsDashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Track your content performance and audience insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8 pb-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-chart-4">+12.5%</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Likes</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">189K</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-chart-4">+8.2%</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Comments
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.3K</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-chart-4">+15.3%</span> from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Followers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45.2K</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-chart-4">+5.7%</span> from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views Over Time</CardTitle>
                  <CardDescription>
                    Daily video views for the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>
                    Likes and comments over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="likes" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="comments" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Videos */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>
                  Your most successful content this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVideos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{video.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {video.views} views
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-chart-4">
                          {video.engagement}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          engagement
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
