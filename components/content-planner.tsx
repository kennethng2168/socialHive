"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Plus, Clock, Eye, Target, Sparkles } from "lucide-react"

const plannedContent = [
  {
    id: 1,
    date: "2024-01-15",
    title: "Morning Routine Tips",
    type: "Tutorial",
    status: "scheduled",
    estimatedViews: "500K",
    optimalTime: "7:00 AM",
  },
  {
    id: 2,
    date: "2024-01-16",
    title: "Productivity Hacks",
    type: "Tips",
    status: "draft",
    estimatedViews: "750K",
    optimalTime: "6:30 PM",
  },
  {
    id: 3,
    date: "2024-01-17",
    title: "Healthy Breakfast Ideas",
    type: "Recipe",
    status: "idea",
    estimatedViews: "400K",
    optimalTime: "12:00 PM",
  },
]

export function ContentPlanner() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-700"
      case "draft":
        return "bg-yellow-100 text-yellow-700"
      case "idea":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-chart-4" />
          Content Planner
        </CardTitle>
        <CardDescription>Plan and schedule your content for optimal performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Calendar */}
          <div>
            <h3 className="font-medium text-sm mb-3">Content Calendar</h3>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1">
                <Plus className="h-3 w-3 mr-1" />
                Add Content
              </Button>
              <Button size="sm" variant="outline">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Suggest
              </Button>
            </div>
          </div>

          {/* Planned Content */}
          <div>
            <h3 className="font-medium text-sm mb-3">Upcoming Content</h3>
            <div className="space-y-3">
              {plannedContent.map((content) => (
                <div key={content.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{content.title}</h4>
                      <p className="text-xs text-muted-foreground">{content.type}</p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{content.optimalTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{content.estimatedViews}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent">
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Strategy Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">This Week's Goal</p>
                  <p className="text-lg font-bold">3 Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Eye className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Est. Total Views</p>
                  <p className="text-lg font-bold">1.65M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <Sparkles className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Score</p>
                  <p className="text-lg font-bold">8.7/10</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
