"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, Hash, Music, Sparkles, Eye, Heart } from "lucide-react";

const trendingHashtags = [
  { tag: "#MorningRoutine", posts: "2.3M", growth: "+15%" },
  { tag: "#QuickRecipes", posts: "1.8M", growth: "+23%" },
  { tag: "#WorkoutMotivation", posts: "1.5M", growth: "+8%" },
  { tag: "#TechReview", posts: "1.2M", growth: "+12%" },
  { tag: "#DIYProjects", posts: "980K", growth: "+18%" },
];

const trendingSounds = [
  { name: "Upbeat Morning Vibes", creator: "AudioMaster", uses: "450K" },
  { name: "Chill Study Beats", creator: "LoFiLab", uses: "380K" },
  { name: "Workout Energy", creator: "FitBeats", uses: "320K" },
  { name: "Cooking Background", creator: "KitchenTunes", uses: "290K" },
];

const viralContent = [
  {
    title: "10-Second Breakfast Hack",
    views: "5.2M",
    likes: "890K",
    category: "Food",
  },
  {
    title: "Phone Photography Tips",
    views: "4.8M",
    likes: "720K",
    category: "Tech",
  },
  {
    title: "5-Minute Workout",
    views: "4.1M",
    likes: "650K",
    category: "Fitness",
  },
  {
    title: "Room Makeover Timelapse",
    views: "3.9M",
    likes: "580K",
    category: "Lifestyle",
  },
];

export function TrendsDashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trends</h1>
            <p className="text-sm text-gray-600">
              Discover what's trending and get inspired
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Trend Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8 pb-8">
            {/* Trending Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-chart-1" />
              Trending Hashtags
            </CardTitle>
            <CardDescription>Most popular hashtags this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingHashtags.map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-chart-1">{hashtag.tag}</p>
                  <p className="text-sm text-muted-foreground">
                    {hashtag.posts} posts
                  </p>
                </div>
                <Badge variant="secondary" className="text-chart-4">
                  {hashtag.growth}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-chart-2" />
              Trending Sounds
            </CardTitle>
            <CardDescription>Popular audio tracks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingSounds.map((sound, index) => (
              <div key={index} className="space-y-1">
                <p className="font-medium">{sound.name}</p>
                <p className="text-sm text-muted-foreground">
                  by {sound.creator}
                </p>
                <p className="text-xs text-chart-2">{sound.uses} uses</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-3" />
              Viral Content
            </CardTitle>
            <CardDescription>Top performing videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {viralContent.map((content, index) => (
              <div key={index} className="space-y-2">
                <p className="font-medium">{content.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {content.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {content.likes}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {content.category}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

            {/* AI Trend Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Trend Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-accent/20 rounded-lg bg-accent/5">
                    <h3 className="font-medium text-accent mb-2">
                      Recommended for You
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Based on your cooking content, try incorporating #HealthyMeals
                      trending hashtag
                    </p>
                    <Button size="sm" variant="outline">
                      Use This Trend
                    </Button>
                  </div>
                  <div className="p-4 border border-chart-4/20 rounded-lg bg-chart-4/5">
                    <h3 className="font-medium text-chart-4 mb-2">
                      Optimal Posting Time
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your audience is most active between 6-8 PM on weekdays
                    </p>
                    <Button size="sm" variant="outline">
                      Schedule Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
