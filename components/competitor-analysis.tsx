"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Search, TrendingUp, Eye, Heart, Users, Zap, Plus, ExternalLink, BarChart3 } from "lucide-react"

const competitors = [
  {
    id: 1,
    username: "@wellness_guru",
    name: "Sarah Johnson",
    followers: "2.4M",
    avgViews: "890K",
    engagementRate: "8.2%",
    postFrequency: "Daily",
    topContent: [
      {
        title: "Morning Routine That Changed My Life",
        views: "1.2M",
        likes: "89K",
        engagement: "7.4%",
      },
      {
        title: "5 Habits for Better Sleep",
        views: "980K",
        likes: "76K",
        engagement: "7.8%",
      },
    ],
    strengths: ["Consistent posting", "High engagement", "Authentic content"],
    opportunities: ["Video length optimization", "Trending hashtag usage"],
    similarity: 85,
  },
  {
    id: 2,
    username: "@productivity_pro",
    name: "Mike Chen",
    followers: "1.8M",
    avgViews: "650K",
    engagementRate: "9.1%",
    postFrequency: "5x/week",
    topContent: [
      {
        title: "The 2-Minute Rule Explained",
        views: "1.5M",
        likes: "112K",
        engagement: "7.5%",
      },
      {
        title: "Time Blocking Method",
        views: "890K",
        likes: "67K",
        engagement: "7.5%",
      },
    ],
    strengths: ["Educational content", "Clear explanations", "Actionable tips"],
    opportunities: ["Content variety", "Collaboration potential"],
    similarity: 78,
  },
  {
    id: 3,
    username: "@healthy_habits",
    name: "Emma Davis",
    followers: "1.2M",
    avgViews: "420K",
    engagementRate: "6.8%",
    postFrequency: "4x/week",
    topContent: [
      {
        title: "Meal Prep Sunday Routine",
        views: "780K",
        likes: "54K",
        engagement: "6.9%",
      },
      {
        title: "Quick Healthy Snacks",
        views: "650K",
        likes: "45K",
        engagement: "6.9%",
      },
    ],
    strengths: ["Recipe content", "Visual appeal", "Practical tips"],
    opportunities: ["Posting consistency", "Trend adoption"],
    similarity: 72,
  },
]

export function CompetitorAnalysis() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetitor, setSelectedCompetitor] = useState<number | null>(null)

  const filteredCompetitors = competitors.filter(
    (competitor) =>
      competitor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Competitor Analysis
          </CardTitle>
          <CardDescription>Analyze your competitors' strategies and discover opportunities for growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search competitors by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Competitor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredCompetitors.map((competitor) => (
          <Card key={competitor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {competitor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{competitor.name}</h3>
                    <p className="text-sm text-muted-foreground">{competitor.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {competitor.similarity}% similar
                  </Badge>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{competitor.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{competitor.avgViews}</p>
                  <p className="text-xs text-muted-foreground">Avg Views</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{competitor.engagementRate}</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{competitor.postFrequency}</p>
                  <p className="text-xs text-muted-foreground">Posting</p>
                </div>
              </div>

              {/* Top Content */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Top Performing Content
                </h4>
                <div className="space-y-2">
                  {competitor.topContent.map((content, index) => (
                    <div key={index} className="p-2 bg-muted/30 rounded text-xs">
                      <p className="font-medium line-clamp-1">{content.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {content.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {content.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {content.engagement}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Opportunities */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-600">Strengths</h4>
                  <div className="space-y-1">
                    {competitor.strengths.map((strength, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs block w-fit border-green-200 text-green-700"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 text-accent">Opportunities</h4>
                  <div className="space-y-1">
                    {competitor.opportunities.map((opportunity, index) => (
                      <Badge key={index} variant="outline" className="text-xs block w-fit border-accent/30 text-accent">
                        {opportunity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Similarity Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Content Similarity</span>
                  <span className="text-sm font-bold text-primary">{competitor.similarity}%</span>
                </div>
                <Progress value={competitor.similarity} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Based on content themes, audience overlap, and posting patterns
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Zap className="h-3 w-3 mr-1" />
                  Analyze Content
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Users className="h-3 w-3 mr-1" />
                  Compare Audience
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompetitors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No competitors found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add competitors to analyze their strategies and find growth opportunities
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
