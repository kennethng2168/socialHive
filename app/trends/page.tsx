"use client";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  Hash,
  Music,
  Sparkles,
  Eye,
  Heart,
} from "lucide-react";

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

export default function TrendsPage() {
  return (
    <AppLayout>
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Trends & Analytics Hub
            </h1>
            <p className="text-gray-600">
              Discover what's trending and get inspired. Track viral content, trending hashtags, and optimize your posting strategy.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Trending Data */}
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Trending Hashtags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Trending Hashtags
                </CardTitle>
                <CardDescription>
                  Most popular hashtags this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingHashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-blue-600">{hashtag.tag}</p>
                      <p className="text-sm text-gray-600">
                        {hashtag.posts} posts
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {hashtag.growth}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trending Sounds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Trending Sounds
                </CardTitle>
                <CardDescription>Popular audio tracks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingSounds.map((sound, index) => (
                  <div key={index} className="space-y-1">
                    <p className="font-medium">{sound.name}</p>
                    <p className="text-sm text-gray-600">by {sound.creator}</p>
                    <p className="text-xs text-purple-600">{sound.uses} uses</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Viral Content & Insights */}
          <div className="h-full">
            <div className="space-y-6">
              {/* Viral Content */}
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Viral Content
                  </CardTitle>
                  <CardDescription>Top performing videos</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {viralContent.map((content, index) => (
                    <div
                      key={index}
                      className="space-y-2 p-3 border border-gray-200 rounded-lg"
                    >
                      <p className="font-medium">{content.title}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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

              {/* AI Trend Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Trend Insights
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h3 className="font-medium text-blue-800 mb-2">
                        Recommended for You
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Based on your cooking content, try incorporating
                        #HealthyMeals trending hashtag
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Use This Trend
                      </Button>
                    </div>
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h3 className="font-medium text-green-800 mb-2">
                        Optimal Posting Time
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Your audience is most active between 6-8 PM on weekdays
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        Schedule Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
