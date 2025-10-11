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
  return (
    <AppLayout>
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            {/* Tool Icon and Title */}
            <div className="flex items-center gap-2">
              <img src="/mainPage_assets/flower.png" alt="AI Content Assistant" className="h-10" />
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Content Assistant
                </h1>
                <p className="text-gray-600 text-sm">
                  Your intelligent companion for social media success
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
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
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
