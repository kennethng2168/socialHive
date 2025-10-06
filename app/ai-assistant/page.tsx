"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Bot,
  BarChart3,
  Sparkles,
  TrendingUp,
  Film,
  Camera,
  Shirt,
  Settings,
  Crown,
  MessageCircle,
  Zap,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";

export default function AIAssistantPage() {
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
                  onClick={() => setShowDropdown(!showDropdown)}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
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
            <div className="flex items-center gap-2 mb-0">
              <img src="/mainPage_assets/flower.png" className="h-10" />
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  AI Content Assistant
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Your intelligent companion for social media success. Get
                  personalized insights, content strategies, and AI-powered
                  recommendations.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - AI Tools */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  AI Tools & Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-md font-medium">Available Tools</span>
                    <Badge className="bg-gray-200 text-gray-500 rounded-2xl px-6 py-1 text-sm">
                      Premium
                    </Badge>
                  </div>
                  <Button className="flex items-center gap-2 bg-primary text-white">
                    <Crown className="h-4 w-4" />
                    AI Powered
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Smart Analytics</h3>
                      <p className="text-sm text-gray-600">
                        AI-powered insights and performance tracking
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Get AI-powered insights into your content performance,
                    audience engagement, and growth opportunities.
                  </p>
                  <Button asChild className="w-full bg-black">
                    <Link href="/analytics">View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Content Ideas</h3>
                      <p className="text-sm text-gray-600">
                        Discover trending topics and formats
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Discover trending topics, hashtags, and content formats that
                    resonate with your audience.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-black text-white"
                    variant="outline"
                  >
                    <Link href="/ai-inspiration">Get Inspired</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Trend Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Real-time trend predictions
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Stay ahead with real-time trend analysis and predictions for
                    your market and audience.
                  </p>
                  <Button
                    asChild
                    className="w-full bg-black text-white"
                    variant="outline"
                  >
                    <Link href="/trends">Explore Trends</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - AI Assistant Chat */}
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    AI Assistant Chat
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-6">
                <div className="w-full space-y-6">
                  {/* AI Assistant Status */}
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Bot className="h-16 w-16 text-primary mx-auto" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        AI Assistant Ready
                      </h3>
                      <p className="text-primary font-medium">
                        Always available to help with your content strategy
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Link href="/ai-tools?tab=video">
                          <Film className="h-5 w-5" />
                          <span className="text-sm">Create Videos</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Link href="/image-gen">
                          <Camera className="h-5 w-5" />
                          <span className="text-sm">Generate Images</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Link href="/virtual-try-on">
                          <Shirt className="h-5 w-5" />
                          <span className="text-sm">Virtual Try-On</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        <Link href="/copywriting">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm">AI Copywriting</span>
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Floating Assistant Info */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 text-center">
                    <h4 className="font-semibold mb-2">
                      Floating AI Assistant
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      Look for the floating AI button in the bottom-right corner
                      for instant help with content strategy, analytics
                      insights, and platform guidance.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <Sparkles className="h-4 w-4" />
                      <span>Always available →</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
