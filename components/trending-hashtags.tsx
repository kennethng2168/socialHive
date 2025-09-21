"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TrendingUp, Hash, Plus, Search, Zap } from "lucide-react"

const trendingHashtags = [
  { tag: "MorningRoutine", engagement: "2.4M", trend: "up", category: "lifestyle" },
  { tag: "ProductivityHacks", engagement: "1.8M", trend: "up", category: "productivity" },
  { tag: "LifeHacks", engagement: "3.2M", trend: "stable", category: "general" },
  { tag: "Wellness", engagement: "1.5M", trend: "up", category: "health" },
  { tag: "SelfCare", engagement: "2.1M", trend: "up", category: "health" },
  { tag: "Mindset", engagement: "987K", trend: "down", category: "motivation" },
  { tag: "Motivation", engagement: "4.1M", trend: "up", category: "motivation" },
  { tag: "HealthyLiving", engagement: "1.3M", trend: "stable", category: "health" },
]

export function TrendingHashtags() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const filteredHashtags = trendingHashtags.filter((hashtag) =>
    hashtag.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Hashtags
        </CardTitle>
        <CardDescription>Discover and add trending hashtags to boost your reach</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recommended for you</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              <Zap className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>

          <div className="grid gap-2">
            {filteredHashtags.slice(0, 6).map((hashtag) => (
              <div
                key={hashtag.tag}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedTags.includes(hashtag.tag)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleTag(hashtag.tag)}
              >
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">#{hashtag.tag}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{hashtag.engagement} posts</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          hashtag.trend === "up"
                            ? "bg-green-100 text-green-800"
                            : hashtag.trend === "down"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-slate-800"
                        }`}
                      >
                        {hashtag.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant={selectedTags.includes(hashtag.tag) ? "default" : "outline"}>
                  {selectedTags.includes(hashtag.tag) ? "Added" : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Selected ({selectedTags.length})</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
