"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Clock, Target, Lightbulb, ArrowRight } from "lucide-react"

export function AIInsights() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Insights
        </CardTitle>
        <CardDescription>Personalized recommendations to boost your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <TrendingUp className="h-4 w-4 text-accent mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Optimal Posting Time</p>
              <p className="text-xs text-slate-700">Post between 7-9 PM for 23% higher engagement</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              High Impact
            </Badge>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-4 w-4 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Trending Topic</p>
              <p className="text-xs text-black">#MorningRoutine is trending in your niche</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Trending
            </Badge>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
            <Clock className="h-4 w-4 text-chart-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Video Length</p>
              <p className="text-xs text-slate-700">30-45 second videos perform best for your audience</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Optimize
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Content Ideas</span>
          </div>
          <div className="space-y-2">
            {[
              "5-minute morning workout routine",
              "Healthy breakfast prep ideas",
              "Productivity hacks for students",
            ].map((idea, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm">{idea}</span>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full bg-transparent" variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          Get More AI Suggestions
        </Button>
      </CardContent>
    </Card>
  )
}
