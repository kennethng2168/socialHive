"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Hash, Sparkles, TrendingUp, Copy, RefreshCw, Target, Zap } from "lucide-react"

const hashtagSuggestions = {
  trending: [
    { tag: "MorningRoutine", posts: "2.4M", trend: "up", engagement: "high" },
    { tag: "ProductivityHacks", posts: "1.8M", trend: "up", engagement: "high" },
    { tag: "LifeHacks", posts: "3.2M", trend: "stable", engagement: "medium" },
    { tag: "Wellness", posts: "1.5M", trend: "up", engagement: "high" },
  ],
  niche: [
    { tag: "CreatorTips", posts: "890K", trend: "up", engagement: "high" },
    { tag: "ContentStrategy", posts: "654K", trend: "stable", engagement: "medium" },
    { tag: "SocialMediaTips", posts: "1.2M", trend: "up", engagement: "high" },
    { tag: "InfluencerLife", posts: "987K", trend: "down", engagement: "low" },
  ],
  longTail: [
    { tag: "MorningRoutineForBusyPeople", posts: "45K", trend: "up", engagement: "high" },
    { tag: "ProductivityHacksForStudents", posts: "32K", trend: "up", engagement: "high" },
    { tag: "HealthyLifestyleTips2024", posts: "28K", trend: "stable", engagement: "medium" },
    { tag: "WellnessJourneyBeginners", posts: "19K", trend: "up", engagement: "high" },
  ],
}

export function AIHashtagGenerator() {
  const [contentDescription, setContentDescription] = useState("")
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateHashtags = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const copyHashtags = () => {
    const hashtagString = selectedHashtags.map((tag) => `#${tag}`).join(" ")
    navigator.clipboard.writeText(hashtagString)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-accent" />
          AI Hashtag Generator
        </CardTitle>
        <CardDescription>Generate trending hashtags optimized for your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Describe your content</label>
          <Textarea
            placeholder="e.g., Morning routine video showing 5 healthy habits for productivity..."
            value={contentDescription}
            onChange={(e) => setContentDescription(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Button onClick={generateHashtags} disabled={isGenerating || !contentDescription.trim()} className="w-full">
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Hashtags...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Hashtags
            </>
          )}
        </Button>

        {contentDescription && (
          <div className="space-y-4">
            {/* Trending Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Trending Hashtags</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  High Reach
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {hashtagSuggestions.trending.map((hashtag) => (
                  <div
                    key={hashtag.tag}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedHashtags.includes(hashtag.tag)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleHashtag(hashtag.tag)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{hashtag.tag}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          hashtag.engagement === "high"
                            ? "border-green-200 text-green-700"
                            : "border-yellow-200 text-yellow-700"
                        }`}
                      >
                        {hashtag.engagement}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Niche Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Niche Hashtags</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  Targeted
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {hashtagSuggestions.niche.map((hashtag) => (
                  <div
                    key={hashtag.tag}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedHashtags.includes(hashtag.tag)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleHashtag(hashtag.tag)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{hashtag.tag}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          hashtag.engagement === "high"
                            ? "border-green-200 text-green-700"
                            : hashtag.engagement === "medium"
                              ? "border-yellow-200 text-yellow-700"
                              : "border-red-200 text-red-700"
                        }`}
                      >
                        {hashtag.engagement}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Long-tail Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Long-tail Hashtags</span>
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                  Less Competition
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {hashtagSuggestions.longTail.map((hashtag) => (
                  <div
                    key={hashtag.tag}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedHashtags.includes(hashtag.tag)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => toggleHashtag(hashtag.tag)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{hashtag.tag}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          hashtag.engagement === "high"
                            ? "border-green-200 text-green-700"
                            : "border-yellow-200 text-yellow-700"
                        }`}
                      >
                        {hashtag.engagement}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Hashtags */}
            {selectedHashtags.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Selected ({selectedHashtags.length}/30)</span>
                  <Button size="sm" variant="outline" onClick={copyHashtags}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{selectedHashtags.map((tag) => `#${tag}`).join(" ")}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
