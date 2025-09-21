"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Eye, Heart, MessageCircle, Share, Brain, Target, Clock, Users, Zap } from "lucide-react"

const predictionFactors = [
  { factor: "Content Quality", weight: 35, score: 92 },
  { factor: "Trending Topic", weight: 25, score: 78 },
  { factor: "Posting Time", weight: 20, score: 85 },
  { factor: "Hashtag Strategy", weight: 15, score: 88 },
  { factor: "Audience Match", weight: 5, score: 94 },
]

export function PerformancePredictor() {
  const [videoTitle, setVideoTitle] = useState("")
  const [prediction, setPrediction] = useState<any>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  const predictPerformance = () => {
    setIsPredicting(true)

    setTimeout(() => {
      setPrediction({
        overallScore: 87,
        estimatedViews: "850K - 1.2M",
        estimatedLikes: "65K - 89K",
        estimatedComments: "4.2K - 6.8K",
        estimatedShares: "2.1K - 3.4K",
        viralPotential: 73,
        bestPostingTime: "7:30 PM",
        confidence: 89,
      })
      setIsPredicting(false)
    }, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-chart-5" />
          Performance Predictor
        </CardTitle>
        <CardDescription>AI-powered predictions for your content performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Video Title or Description</label>
            <Input
              placeholder="e.g., 5 Morning Habits That Changed My Life"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>

          <Button onClick={predictPerformance} disabled={isPredicting || !videoTitle.trim()} className="w-full">
            {isPredicting ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Performance...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Predict Performance
              </>
            )}
          </Button>
        </div>

        {prediction && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Overall Performance Score</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {prediction.confidence}% confidence
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">{prediction.overallScore}</div>
                <div className="flex-1">
                  <Progress value={prediction.overallScore} className="h-3" />
                </div>
                <div className="text-sm text-muted-foreground">/ 100</div>
              </div>
            </div>

            {/* Predicted Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Eye className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Views</p>
                <p className="text-lg font-bold">{prediction.estimatedViews}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Likes</p>
                <p className="text-lg font-bold">{prediction.estimatedLikes}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Comments</p>
                <p className="text-lg font-bold">{prediction.estimatedComments}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <Share className="h-5 w-5 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Shares</p>
                <p className="text-lg font-bold">{prediction.estimatedShares}</p>
              </div>
            </div>

            {/* Viral Potential */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Viral Potential
                </span>
                <span className="text-sm font-bold text-accent">{prediction.viralPotential}%</span>
              </div>
              <Progress value={prediction.viralPotential} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {prediction.viralPotential > 80
                  ? "High viral potential! This content has excellent chances of going viral."
                  : prediction.viralPotential > 60
                    ? "Good viral potential. Consider optimizing for better reach."
                    : "Moderate viral potential. Focus on engagement optimization."}
              </p>
            </div>

            {/* Performance Factors */}
            <div>
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Performance Factors
              </h3>
              <div className="space-y-3">
                {predictionFactors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm w-32">{factor.factor}</span>
                    <div className="flex-1">
                      <Progress value={factor.score} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-8">{factor.score}%</span>
                    <Badge variant="outline" className="text-xs">
                      {factor.weight}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                AI Recommendations
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <p>
                    Post at <strong>{prediction.bestPostingTime}</strong> for maximum reach
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <p>Your audience shows high interest in this content type</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <p>Consider adding trending hashtags to boost discoverability</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
