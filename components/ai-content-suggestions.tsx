"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Sparkles, TrendingUp, Clock, Users, Lightbulb, RefreshCw, Bookmark, Copy, Zap } from "lucide-react"

const contentIdeas = [
  {
    id: 1,
    title: "5-Minute Morning Meditation for Busy People",
    category: "Wellness",
    difficulty: "Easy",
    viralPotential: 85,
    estimatedViews: "500K - 1.2M",
    bestTime: "7:00 AM",
    targetAudience: "Working professionals, 25-35",
    hooks: [
      "POV: You only have 5 minutes but want to start your day right",
      "This meditation changed my entire morning routine",
      "Busy? Try this 5-minute game-changer",
    ],
    hashtags: ["#MorningMeditation", "#Mindfulness", "#BusyLife", "#Wellness", "#SelfCare"],
    reasoning: "Trending topic with high engagement. Your audience shows 73% interest in wellness content.",
  },
  {
    id: 2,
    title: "Productivity Hack: The 2-Minute Rule",
    category: "Productivity",
    difficulty: "Medium",
    viralPotential: 92,
    estimatedViews: "800K - 2.1M",
    bestTime: "6:30 PM",
    targetAudience: "Students & professionals, 20-40",
    hooks: [
      "This 2-minute rule will change how you work forever",
      "Why successful people swear by the 2-minute rule",
      "Stop procrastinating with this simple trick",
    ],
    hashtags: ["#ProductivityHacks", "#TimeManagement", "#LifeHacks", "#Success", "#Motivation"],
    reasoning:
      "High viral potential based on similar content performance. Matches your audience's interests perfectly.",
  },
  {
    id: 3,
    title: "Healthy Snack Prep in Under 10 Minutes",
    category: "Food & Health",
    difficulty: "Easy",
    viralPotential: 78,
    estimatedViews: "400K - 900K",
    bestTime: "12:00 PM",
    targetAudience: "Health-conscious individuals, 22-45",
    hooks: [
      "Meal prep but make it snacks",
      "10 minutes to a week of healthy snacking",
      "These snack prep ideas will save your diet",
    ],
    hashtags: ["#HealthySnacks", "#MealPrep", "#HealthyEating", "#QuickRecipes", "#Nutrition"],
    reasoning: "Food content performs well in your niche. Seasonal trend shows increasing interest in healthy eating.",
  },
]

export function AIContentSuggestions() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [savedIdeas, setSavedIdeas] = useState<number[]>([])

  const generateNewIdeas = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const toggleSave = (id: number) => {
    setSavedIdeas((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-accent" />
            AI Content Suggestions
          </CardTitle>
          <CardDescription>
            Personalized content ideas based on your audience, trending topics, and performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">94%</p>
                <p className="text-xs text-muted-foreground">Match Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">New Ideas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-2">8.5</p>
                <p className="text-xs text-muted-foreground">Avg Viral Score</p>
              </div>
            </div>
            <Button onClick={generateNewIdeas} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New Ideas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Ideas Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {contentIdeas.map((idea) => (
          <Card key={idea.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{idea.category}</Badge>
                    <Badge variant="secondary">{idea.difficulty}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleSave(idea.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Bookmark className={`h-4 w-4 ${savedIdeas.includes(idea.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Viral Potential */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3 text-accent" />
                    Viral Potential
                  </span>
                  <span className="text-sm font-bold text-accent">{idea.viralPotential}%</span>
                </div>
                <Progress value={idea.viralPotential} className="h-2" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Est. Views</p>
                    <p className="text-muted-foreground">{idea.estimatedViews}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Best Time</p>
                    <p className="text-muted-foreground">{idea.bestTime}</p>
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Target Audience</p>
                  <p className="text-sm text-muted-foreground">{idea.targetAudience}</p>
                </div>
              </div>

              {/* Hook Ideas */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Hook Ideas
                </p>
                <div className="space-y-1">
                  {idea.hooks.slice(0, 2).map((hook, index) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                      "{hook}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <p className="text-sm font-medium mb-2">Recommended Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {idea.hashtags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {idea.hashtags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{idea.hashtags.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-xs text-muted-foreground">
                  <strong>AI Insight:</strong> {idea.reasoning}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" className="flex-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Create Content
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Idea
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
