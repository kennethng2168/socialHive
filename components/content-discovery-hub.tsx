"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Search, Filter, Sparkles, Target, Brain, Bookmark } from "lucide-react"
import { TrendingContent } from "@/components/trending-content"
import { AIContentSuggestions } from "@/components/ai-content-suggestions"
import { CompetitorAnalysis } from "@/components/competitor-analysis"

export function ContentDiscoveryHub() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("global")

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">Content Discovery Hub</h1>
          <p className="text-muted-foreground">Discover trending content and get AI-powered inspiration</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trending topics, hashtags, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Competitor Analysis
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Ideas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-6">
          <TrendingContent searchQuery={searchQuery} category={selectedCategory} region={selectedRegion} />
        </TabsContent>

        <TabsContent value="ai-suggestions" className="space-y-6">
          <AIContentSuggestions />
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <CompetitorAnalysis />
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Content Ideas</CardTitle>
              <CardDescription>Your bookmarked inspiration and content ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No saved ideas yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring trending content and save ideas for later
                </p>
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Trending
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
