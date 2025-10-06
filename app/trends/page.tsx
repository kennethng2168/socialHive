"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
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
  BarChart3,
  Settings,
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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="block">
              <div className="flex items-center">
                <img
                  src="/socialHive-logo.png"
                  alt="SocialHive Logo"
                  className="h-8"
                />
              </div>
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Amber Chen</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-600 rounded-full" />
              </div>
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border-2 0 z-50">
                    <a
                      href="/analytics"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-3 text-gray-500" />
                      Analytics
                    </a>
                    <a
                      href="/trends"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 mr-3 text-gray-500" />
                      Trends
                    </a>
                    <a
                      href="/tools"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      All Tools
                    </a>
                    <a
                      href="/comments"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comments
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        alert("Logout functionality would be implemented here");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="h-4 w-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Tool Icon and Title */}
            <div className="flex items-center gap-4 mb-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  AI Trends & Analytics Hub
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Discover what's trending and get inspired. Track viral
                  content, trending hashtags, and optimize your posting
                  strategy.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
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

        {/* Bottom Link */}
        <div className="bg-white py-8">
          <div className="flex justify-center">
            <a
              href="/"
              className="text-blue-500 hover:text-blue-500 font-medium text-md flex items-center space-x-2 transition-colors underline"
            >
              <span>Keep creating — discover more AI tools</span>
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M13 5H19V11" />
                <path d="M19 5L5 19" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
