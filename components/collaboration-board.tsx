"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, Clock, Star, Search } from "lucide-react"

export function CollaborationBoard() {
  const [searchTerm, setSearchTerm] = useState("")

  const collaborationOpportunities = [
    {
      id: 1,
      title: "Dance Challenge Collab",
      creator: "DanceKing",
      avatar: "/placeholder.svg?key=dance1",
      followers: "2.3M",
      location: "Los Angeles, CA",
      deadline: "3 days left",
      description:
        "Looking for 3 creators to join a viral dance challenge. Must have 100K+ followers and dance experience.",
      tags: ["dance", "viral", "challenge"],
      applications: 24,
      rating: 4.9,
    },
    {
      id: 2,
      title: "Food Recipe Series",
      creator: "CookingMama",
      avatar: "/placeholder.svg?key=cook1",
      followers: "1.8M",
      location: "New York, NY",
      deadline: "1 week left",
      description:
        "Creating a 10-part cooking series. Need creators who can bring unique cultural recipes and cooking styles.",
      tags: ["food", "cooking", "series"],
      applications: 18,
      rating: 4.8,
    },
    {
      id: 3,
      title: "Tech Review Roundtable",
      creator: "TechGuru",
      avatar: "/placeholder.svg?key=tech1",
      followers: "1.5M",
      location: "Remote",
      deadline: "5 days left",
      description:
        "Monthly tech review discussion with multiple creators. Share insights on latest gadgets and trends.",
      tags: ["tech", "review", "discussion"],
      applications: 31,
      rating: 4.7,
    },
  ]

  const filteredOpportunities = collaborationOpportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Collaboration Board</h2>
          <p className="text-slate-600">Find creators to collaborate with on your next viral content</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">Post Opportunity</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search collaborations by title, creator, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <MapPin className="w-4 h-4 mr-2" />
          Location
        </Button>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Followers
        </Button>
      </div>

      {/* Collaboration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={opportunity.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{opportunity.creator[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900">{opportunity.creator}</h3>
                    <p className="text-sm text-slate-500">{opportunity.followers} followers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{opportunity.rating}</span>
                </div>
              </div>
              <CardTitle className="text-lg mt-3">{opportunity.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 text-sm leading-relaxed">{opportunity.description}</p>

              <div className="flex items-center space-x-2">
                {opportunity.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{opportunity.deadline}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-500">{opportunity.applications} applications</span>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No collaborations found</h3>
          <p className="text-slate-500">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  )
}
