"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Search,
  TrendingUp,
  Lightbulb,
  Zap,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";

const inspirationCategories = [
  { name: "Trending Now", icon: TrendingUp, count: 234, color: "text-chart-1" },
  {
    name: "Creative Ideas",
    icon: Lightbulb,
    count: 156,
    color: "text-chart-2",
  },
  { name: "AI Generated", icon: Zap, count: 89, color: "text-accent" },
  { name: "Viral Content", icon: Sparkles, count: 67, color: "text-chart-4" },
];

const inspirationPosts = [
  {
    title: "Morning Routine Aesthetic",
    description:
      "Minimalist morning routine with natural lighting and clean aesthetics",
    views: "2.3M",
    likes: "189K",
    comments: "12K",
    tags: ["morning", "aesthetic", "routine"],
    aiGenerated: true,
  },
  {
    title: "Quick Recipe Transitions",
    description:
      "Smooth transitions between cooking steps with dynamic camera movements",
    views: "1.8M",
    likes: "145K",
    comments: "8K",
    tags: ["cooking", "transitions", "food"],
    aiGenerated: false,
  },
  {
    title: "Workout Motivation",
    description: "High-energy workout content with motivational text overlays",
    views: "1.5M",
    likes: "123K",
    comments: "6K",
    tags: ["fitness", "motivation", "workout"],
    aiGenerated: true,
  },
  {
    title: "Tech Review Setup",
    description:
      "Professional tech review setup with perfect lighting and angles",
    views: "1.2M",
    likes: "98K",
    comments: "4K",
    tags: ["tech", "review", "setup"],
    aiGenerated: false,
  },
];

export function AIInspirationHub() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              AI Inspiration
            </h1>
            <p className="text-muted-foreground">
              Discover trending content and get AI-powered creative ideas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for inspiration..."
                className="pl-10 w-64"
              />
            </div>
            <Button className="bg-accent hover:bg-accent/90">
              <Zap className="h-4 w-4 mr-2" />
              Generate Ideas
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8 pb-8">
            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {inspirationCategories.map((category, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore {category.count} ideas
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI-Powered Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 ">
                  <Zap className="h-5 w-5 text-accent" />
                  AI-Powered Suggestions
                </CardTitle>
                <CardDescription>
                  Personalized content ideas based on your style and trending
                  topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-accent/20 rounded-lg bg-accent/5">
                    <h3 className="font-medium text-accent mb-2">
                      Trending Topic Match
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a "5-minute morning routine" video - this topic is
                      trending in your niche with 89% engagement rate
                    </p>
                    <Button size="sm" variant="outline">
                      Use This Idea
                    </Button>
                  </div>
                  <div className="p-4 border border-chart-2/20 rounded-lg bg-chart-2/5">
                    <h3 className="font-medium text-chart-2 mb-2">
                      Style Recommendation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Try adding smooth transitions to your cooking videos -
                      similar creators see 23% more engagement
                    </p>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inspiration Feed */}
          <div className="space-y-6 px-6 pb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trending Inspiration</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  All
                </Button>
                <Button variant="outline" size="sm">
                  AI Generated
                </Button>
                <Button variant="outline" size="sm">
                  Viral
                </Button>
                <Button variant="outline" size="sm">
                  Recent
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inspirationPosts.map((post, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Preview</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      {post.aiGenerated && (
                        <Badge
                          variant="secondary"
                          className="bg-accent/10 text-accent text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {post.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.comments}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
