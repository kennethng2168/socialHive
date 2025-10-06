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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Reply,
  Flag,
  MoreHorizontal,
  Clock,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Settings,
  MessageCircle,
} from "lucide-react";

const comments = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      username: "@sarahj_dance",
      avatar: "/placeholder-user.jpg",
    },
    content: "This dance is absolutely amazing! Can you do a tutorial? 🔥",
    timestamp: "2 hours ago",
    likes: 24,
    replies: 3,
    postTitle: "Summer Vibes Dance Challenge",
    status: "approved",
  },
  {
    id: 2,
    user: {
      name: "Mike Chen",
      username: "@mikecooks",
      avatar: "/placeholder-user.jpg",
    },
    content: "The pasta looks delicious! What type of sauce did you use?",
    timestamp: "5 hours ago",
    likes: 12,
    replies: 1,
    postTitle: "Quick Recipe: 5-Minute Pasta",
    status: "approved",
  },
  {
    id: 3,
    user: {
      name: "Anonymous User",
      username: "@user123",
      avatar: "/placeholder-user.jpg",
    },
    content: "This is spam content that needs moderation",
    timestamp: "1 day ago",
    likes: 0,
    replies: 0,
    postTitle: "Behind the Scenes: Studio Setup",
    status: "pending",
  },
];

export default function CommentsPage() {
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
                      <MessageCircle className="h-4 w-4 mr-3 text-gray-500" />
                      Comments
                    </a>
                    <div className="border-t border-gray-200 my-1"></div>
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
                  Comments Dashboard
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Manage and moderate your community interactions. Track
                  engagement, respond to comments, and maintain a healthy
                  community.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
              <p className="text-gray-600">
                Manage and moderate your community interactions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search comments..." className="pl-9 w-64" />
              </div>
            </div>
          </div>

          {/* Comments Content */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All Comments</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card
                    key={comment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={comment.user.avatar || "/placeholder.svg"}
                            alt={comment.user.name}
                          />
                          <AvatarFallback>
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {comment.user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {comment.user.username}
                            </span>
                            <span className="text-sm text-gray-400">•</span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {comment.timestamp}
                            </div>
                            <Badge
                              variant={
                                comment.status === "approved"
                                  ? "default"
                                  : comment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                comment.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : comment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {comment.status}
                            </Badge>
                          </div>

                          <p className="text-gray-900 mb-2">
                            {comment.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="text-xs text-gray-500">
                                On: {comment.postTitle}
                              </span>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {comment.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Reply className="h-4 w-4" />
                                {comment.replies}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Reply className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Flag className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="p-6">
                <p className="text-gray-600">
                  Approved comments will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="p-6">
                <p className="text-gray-600">
                  Comments awaiting moderation will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="flagged" className="space-y-4">
              <div className="p-6">
                <p className="text-gray-600">
                  Flagged comments will appear here
                </p>
              </div>
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
