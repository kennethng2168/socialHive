"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Type, Hash, Calendar, BarChart3, Users, Target, Zap, Brain, Sparkles, TrendingUp } from "lucide-react"
import { AIHashtagGenerator } from "@/components/ai-hashtag-generator"
import { CaptionOptimizer } from "@/components/caption-optimizer"
import { TrendAnalyzer } from "@/components/trend-analyzer"
import { AudienceInsights } from "@/components/audience-insights"
import { ContentPlanner } from "@/components/content-planner"
import { PerformancePredictor } from "@/components/performance-predictor"

const toolCategories = [
  {
    id: "ai-tools",
    name: "AI Tools",
    icon: Brain,
    description: "AI-powered content optimization",
    tools: [
      { name: "Caption Optimizer", icon: Type, description: "AI-enhanced captions", badge: "Popular" },
      { name: "Hashtag Generator", icon: Hash, description: "Trending hashtag suggestions", badge: "New" },
      { name: "Performance Predictor", icon: TrendingUp, description: "Predict video success", badge: "Beta" },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    description: "Deep insights and trends",
    tools: [
      { name: "Trend Analyzer", icon: Target, description: "Spot emerging trends", badge: null },
      { name: "Audience Insights", icon: Users, description: "Know your audience", badge: "Pro" },
      { name: "Competitor Tracking", icon: TrendingUp, description: "Monitor competitors", badge: null },
    ],
  },
  {
    id: "planning",
    name: "Planning",
    icon: Calendar,
    description: "Content strategy and scheduling",
    tools: [
      { name: "Content Planner", icon: Calendar, description: "Plan your content calendar", badge: null },
      { name: "Optimal Timing", icon: Zap, description: "Best posting times", badge: "AI" },
      { name: "Batch Scheduler", icon: Calendar, description: "Schedule multiple posts", badge: null },
    ],
  },
]

export function CreatorToolsHub() {
  const [activeCategory, setActiveCategory] = useState("ai-tools")

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">Creator Tools</h1>
          <p className="text-muted-foreground">Advanced tools to supercharge your content creation</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            12 AI Tools
          </Badge>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        {toolCategories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeCategory === category.id ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {category.tools.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <tool.icon className="h-3 w-3 text-muted-foreground" />
                      <span>{tool.name}</span>
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool Content */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsContent value="ai-tools" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <CaptionOptimizer />
            <AIHashtagGenerator />
          </div>
          <PerformancePredictor />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <TrendAnalyzer />
            <AudienceInsights />
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <ContentPlanner />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
