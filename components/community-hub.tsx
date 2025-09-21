"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Heart, Share2, Users, TrendingUp, Award, Search, Plus } from "lucide-react"
import { CollaborationBoard } from "./collaboration-board"

export function CommunityHub() {
  const [activeTab, setActiveTab] = useState("feed")

  const communityPosts = [
    {
      id: 1,
      author: "CreatorMike",
      avatar: "/placeholder.svg?key=pos29",
      time: "2h ago",
      content:
        "Just hit 1M views on my latest dance video! The key was posting at 7 PM when my audience is most active. Thanks to the analytics insights! 🔥",
      likes: 234,
      comments: 45,
      shares: 12,
      tags: ["milestone", "dance", "analytics"],
    },
    {
      id: 2,
      author: "FoodieQueen",
      avatar: "/placeholder.svg?key=htbiq",
      time: "4h ago",
      content:
        "Pro tip: Using the AI caption generator increased my engagement by 40%! It suggests the perfect hooks and trending phrases. Game changer for food content!",
      likes: 189,
      comments: 67,
      shares: 23,
      tags: ["tip", "food", "ai-tools"],
    },
    {
      id: 3,
      author: "TechReviewer",
      avatar: "/placeholder.svg?key=mdy9v",
      time: "6h ago",
      content:
        "The trend analyzer predicted the 'Tech in 60 seconds' format would blow up. Posted 3 videos and they all went viral! This platform is incredible.",
      likes: 456,
      comments: 89,
      shares: 34,
      tags: ["tech", "viral", "trends"],
    },
  ]

  const topCreators = [
    { name: "DanceKing", followers: "2.3M", growth: "+15%", avatar: "/placeholder.svg?key=bhzui" },
    { name: "CookingMama", followers: "1.8M", growth: "+12%", avatar: "/placeholder.svg?key=wgyie" },
    { name: "TechGuru", followers: "1.5M", growth: "+18%", avatar: "/placeholder.svg?key=0tp71" },
    { name: "FitnessCoach", followers: "1.2M", growth: "+22%", avatar: "/placeholder.svg?key=6j0st" },
  ]

  const challenges = [
    {
      title: "30-Day Consistency Challenge",
      participants: 1234,
      prize: "$5,000",
      deadline: "15 days left",
      description: "Post daily for 30 days using our AI tools",
    },
    {
      title: "Viral Video Contest",
      participants: 856,
      prize: "$10,000",
      deadline: "7 days left",
      description: "Create the most engaging video this month",
    },
    {
      title: "Creator Collaboration",
      participants: 432,
      prize: "Featured Spotlight",
      deadline: "22 days left",
      description: "Team up with other creators for unique content",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Creator Community</h1>
          <p className="text-slate-600 mt-1">Connect, learn, and grow with fellow creators</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[500px]">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="collab">Collaborations</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Post Creation */}
              <Card className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?key=ufxk8" />
                      <AvatarFallback>YU</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <Textarea
                        placeholder="Share your creator journey, tips, or ask for advice..."
                        className="min-h-[80px] border-slate-200"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            #tip
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #milestone
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            #question
                          </Badge>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Posts */}
              {communityPosts.map((post) => (
                <Card key={post.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarImage src={post.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-slate-900">{post.author}</span>
                          <span className="text-sm text-slate-500">{post.time}</span>
                        </div>
                        <p className="text-slate-700 mb-3 leading-relaxed">{post.content}</p>
                        <div className="flex items-center space-x-2 mb-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-6 text-slate-500">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm">{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Top Creators */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    Top Creators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topCreators.map((creator, index) => (
                    <div key={creator.name} className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={creator.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{creator.name}</p>
                        <p className="text-xs text-slate-500">{creator.followers} followers</p>
                      </div>
                      <Badge variant="outline" className="text-xs text-green-600">
                        {creator.growth}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["#AICreatorTools", "#ViralTips", "#CreatorEconomy", "#ContentStrategy", "#TikTokGrowth"].map(
                    (topic) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-sm font-medium text-slate-700">{topic}</span>
                        <span className="text-xs text-slate-500">2.3k posts</span>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {challenge.participants} participants
                    </span>
                    <Badge variant="outline" className="text-green-600">
                      {challenge.prize}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{challenge.deadline}</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      Join Challenge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collab" className="space-y-6">
          <CollaborationBoard />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">Creator Leaderboard</CardTitle>
              <p className="text-slate-600">Top performing creators this month</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCreators.map((creator, index) => (
                  <div key={creator.name} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{creator.name}</h3>
                      <p className="text-slate-600">{creator.followers} followers</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">{creator.growth} growth</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentorship" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Find a Mentor</CardTitle>
                <p className="text-slate-600">Connect with experienced creators in your niche</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Search by niche or expertise..." className="flex-1" />
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {["Dance & Performance", "Food & Cooking", "Tech Reviews", "Fitness & Health"].map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline">12 mentors</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">Become a Mentor</CardTitle>
                <p className="text-slate-600">Share your expertise and help new creators grow</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 border border-red-100">
                  <h4 className="font-semibold text-red-900 mb-2">Mentor Benefits</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• Exclusive mentor badge</li>
                    <li>• Priority support access</li>
                    <li>• Monthly mentor rewards</li>
                    <li>• Featured creator spotlight</li>
                  </ul>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">Apply to be a Mentor</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
