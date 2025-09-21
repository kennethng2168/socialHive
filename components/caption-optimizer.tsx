"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Type, Sparkles, Eye, Heart, MessageCircle, RefreshCw, Copy, Lightbulb } from "lucide-react"

const optimizationSuggestions = [
  {
    type: "Hook",
    suggestion: "Start with a question or bold statement",
    example: "POV: You discover the morning routine that changed everything",
    impact: "high",
  },
  {
    type: "Call-to-Action",
    suggestion: "Add a clear CTA at the end",
    example: "Which tip will you try first? Comment below!",
    impact: "medium",
  },
  {
    type: "Hashtags",
    suggestion: "Use 3-5 relevant hashtags",
    example: "#MorningRoutine #ProductivityHacks #Wellness",
    impact: "high",
  },
  {
    type: "Length",
    suggestion: "Keep it under 150 characters for better engagement",
    example: "Shorter captions perform 23% better",
    impact: "medium",
  },
]

export function CaptionOptimizer() {
  const [originalCaption, setOriginalCaption] = useState("")
  const [optimizedCaption, setOptimizedCaption] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [engagementScore, setEngagementScore] = useState(0)

  const optimizeCaption = () => {
    setIsOptimizing(true)

    setTimeout(() => {
      const optimized = `POV: You discover the morning routine that actually works ✨

Transform your mornings with these 5 simple habits:
• Wake up 30 mins earlier
• Drink water first thing
• 5-minute meditation
• Write 3 gratitudes
• Move your body

Which one will you try tomorrow? Drop a 🌅 if you're ready to level up!

#MorningRoutine #ProductivityHacks #Wellness #SelfCare #HealthyHabits`

      setOptimizedCaption(optimized)
      setEngagementScore(87)
      setIsOptimizing(false)
    }, 2000)
  }

  const copyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          Caption Optimizer
        </CardTitle>
        <CardDescription>AI-powered caption optimization for maximum engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Original Caption</label>
          <Textarea
            placeholder="Paste your caption here to optimize it..."
            value={originalCaption}
            onChange={(e) => setOriginalCaption(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{originalCaption.length} characters</span>
            <span>{originalCaption.split(" ").filter((word) => word.startsWith("#")).length} hashtags</span>
          </div>
        </div>

        <Button onClick={optimizeCaption} disabled={isOptimizing || !originalCaption.trim()} className="w-full">
          {isOptimizing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Optimizing Caption...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize with AI
            </>
          )}
        </Button>

        {optimizedCaption && (
          <div className="space-y-4">
            {/* Engagement Score */}
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Predicted Engagement Score</span>
                <span className="text-lg font-bold text-accent">{engagementScore}%</span>
              </div>
              <Progress value={engagementScore} className="h-2 mb-2" />
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="h-3 w-3" />
                    <span>Views</span>
                  </div>
                  <p className="font-medium">+23%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="h-3 w-3" />
                    <span>Likes</span>
                  </div>
                  <p className="font-medium">+31%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>Comments</span>
                  </div>
                  <p className="font-medium">+45%</p>
                </div>
              </div>
            </div>

            {/* Optimized Caption */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Optimized Caption</label>
                <Button size="sm" variant="outline" onClick={() => copyCaption(optimizedCaption)}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{optimizedCaption}</p>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{optimizedCaption.length} characters</span>
                <span>{optimizedCaption.split(" ").filter((word) => word.startsWith("#")).length} hashtags</span>
              </div>
            </div>

            {/* Optimization Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Applied Optimizations</span>
              </div>
              <div className="space-y-2">
                {optimizationSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-muted/50 rounded">
                    <Badge
                      variant={suggestion.impact === "high" ? "default" : "secondary"}
                      className={`text-xs ${suggestion.impact === "high" ? "bg-green-500" : ""}`}
                    >
                      {suggestion.type}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{suggestion.suggestion}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
