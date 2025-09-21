"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, TrendingDown, Minus, RefreshCw, Eye, Clock, Users } from "lucide-react"

const trendingTopics = [
  {
    topic: "Morning Routines",
    growth: "+127%",
    trend: "up",
    volume: "2.4M",
    competition: "high",
    opportunity: 85,
    timeframe: "7 days",
    demographics: "25-35, professionals",
  },
  {
    topic: "Productivity Hacks",
    growth: "+89%",
    trend: "up",
    volume: "1.8M",
    competition: "medium",
    opportunity: 92,
    timeframe: "14 days",
    demographics: "20-40, students & workers",
  },
  {
    topic: "Healthy Recipes",
    growth: "+45%",
    trend: "up",
    volume: "3.1M",
    competition: "high",
    opportunity: 67,
    timeframe: "30 days",
    demographics: "25-45, health-conscious",
  },
  {
    topic: "Study Tips",
    growth: "-12%",
    trend: "down",
    volume: "890K",
    competition: "low",
    opportunity: 43,
    timeframe: "7 days",
    demographics: "16-25, students",
  },
  {
    topic: "Home Workouts",
    growth: "+0%",
    trend: "stable",
    volume: "1.2M",
    competition: "medium",
    opportunity: 58,
    timeframe: "14 days",
    demographics: "20-50, fitness enthusiasts",
  },
]

export function TrendAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null)

  const analyzeTrends = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-100"
      case "down":
        return "text-red-600 bg-red-100"
      default:
        return "text-yellow-600 bg-yellow-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-chart-2" />
          Trend Analyzer
        </CardTitle>
        <CardDescription>Discover emerging trends and content opportunities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Last updated: 2 hours ago</div>
          <Button size="sm" variant="outline" onClick={analyzeTrends} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedTrend === topic.topic ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedTrend(selectedTrend === topic.topic ? null : topic.topic)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getTrendIcon(topic.trend)}
                  <h3 className="font-medium">{topic.topic}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getTrendColor(topic.trend)}>
                    {topic.growth}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {topic.competition} competition
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Volume:</span>
                  <span className="font-medium">{topic.volume}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Trending:</span>
                  <span className="font-medium">{topic.timeframe}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Audience:</span>
                  <span className="font-medium text-xs">{topic.demographics}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Opportunity Score</span>
                  <span className="text-sm font-bold text-accent">{topic.opportunity}%</span>
                </div>
                <Progress value={topic.opportunity} className="h-2" />
              </div>

              {selectedTrend === topic.topic && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs font-medium mb-1">Best Content Types</p>
                      <p className="text-xs text-muted-foreground">Tutorials, Tips, Before/After</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-xs font-medium mb-1">Optimal Length</p>
                      <p className="text-xs text-muted-foreground">30-60 seconds</p>
                    </div>
                  </div>
                  <div className="p-3 bg-accent/10 rounded border border-accent/20">
                    <p className="text-xs font-medium mb-1">AI Recommendation</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.opportunity > 80
                        ? "High opportunity! Create content in this niche immediately."
                        : topic.opportunity > 60
                          ? "Good opportunity. Consider creating content with a unique angle."
                          : "Saturated market. Focus on highly specific sub-topics."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
