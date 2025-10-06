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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Type,
  Hash,
  Calendar,
  BarChart3,
  Users,
  Target,
  Zap,
  Brain,
  Sparkles,
  TrendingUp,
  Settings,
} from "lucide-react";
import { AIHashtagGenerator } from "@/components/ai-hashtag-generator";
import { CaptionOptimizer } from "@/components/caption-optimizer";
import { TrendAnalyzer } from "@/components/trend-analyzer";
import { AudienceInsights } from "@/components/audience-insights";
import { ContentPlanner } from "@/components/content-planner";
import { PerformancePredictor } from "@/components/performance-predictor";

const toolCategories = [
  {
    id: "ai-tools",
    name: "AI Tools",
    icon: Brain,
    description: "AI-powered content optimization",
    tools: [
      {
        name: "Caption Optimizer",
        icon: Type,
        description: "AI-enhanced captions",
        badge: "Popular",
      },
      {
        name: "Hashtag Generator",
        icon: Hash,
        description: "Trending hashtag suggestions",
        badge: "New",
      },
      {
        name: "Performance Predictor",
        icon: TrendingUp,
        description: "Predict video success",
        badge: "Beta",
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    icon: BarChart3,
    description: "Deep insights and trends",
    tools: [
      {
        name: "Trend Analyzer",
        icon: Target,
        description: "Spot emerging trends",
        badge: null,
      },
      {
        name: "Audience Insights",
        icon: Users,
        description: "Know your audience",
        badge: "Pro",
      },
      {
        name: "Competitor Tracking",
        icon: TrendingUp,
        description: "Monitor competitors",
        badge: null,
      },
    ],
  },
  {
    id: "planning",
    name: "Planning",
    icon: Calendar,
    description: "Content strategy and scheduling",
    tools: [
      {
        name: "Content Planner",
        icon: Calendar,
        description: "Plan your content calendar",
        badge: null,
      },
      {
        name: "Optimal Timing",
        icon: Zap,
        description: "Best posting times",
        badge: "AI",
      },
      {
        name: "Batch Scheduler",
        icon: Calendar,
        description: "Schedule multiple posts",
        badge: null,
      },
    ],
  },
];

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState("ai-tools");
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
                    <div className="border-t border-gray-200 "></div>
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
                  Creator Tools Hub
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Advanced tools to supercharge your content creation.
                  AI-powered optimization, analytics, and planning tools.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="space-y-6">
          {/* Tool Categories */}
          <div className="grid gap-4 md:grid-cols-3">
            {toolCategories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCategory === category.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <category.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {category.tools.map((tool, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <tool.icon className="h-3 w-3 text-gray-500" />
                          <span>{tool.name}</span>
                        </div>
                        {tool.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tool Content */}
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsContent value="ai-tools" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <CaptionOptimizer />
                <AIHashtagGenerator />
              </div>
              <PerformancePredictor />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <TrendAnalyzer />
                <AudienceInsights />
              </div>
            </TabsContent>

            <TabsContent value="planning" className="space-y-6">
              <ContentPlanner />
            </TabsContent>
          </Tabs>
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
