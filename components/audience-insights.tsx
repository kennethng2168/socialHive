"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, MapPin, Heart, TrendingUp } from "lucide-react"

const audienceData = {
  demographics: {
    ageGroups: [
      { range: "18-24", percentage: 35, color: "bg-chart-1" },
      { range: "25-34", percentage: 42, color: "bg-chart-2" },
      { range: "35-44", percentage: 18, color: "bg-chart-3" },
      { range: "45+", percentage: 5, color: "bg-chart-4" },
    ],
    gender: {
      female: 68,
      male: 30,
      other: 2,
    },
    topLocations: [
      { country: "United States", percentage: 45 },
      { country: "United Kingdom", percentage: 12 },
      { country: "Canada", percentage: 8 },
      { country: "Australia", percentage: 6 },
      { country: "Germany", percentage: 5 },
    ],
  },
  behavior: {
    peakHours: [
      { time: "6-8 AM", activity: 25 },
      { time: "12-2 PM", activity: 35 },
      { time: "6-9 PM", activity: 85 },
      { time: "9-11 PM", activity: 65 },
    ],
    interests: [
      { topic: "Wellness & Health", engagement: 92 },
      { topic: "Productivity", engagement: 87 },
      { topic: "Lifestyle", engagement: 78 },
      { topic: "Education", engagement: 65 },
      { topic: "Entertainment", engagement: 58 },
    ],
  },
}

export function AudienceInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-chart-3" />
          Audience Insights
        </CardTitle>
        <CardDescription>Deep insights into your audience demographics and behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Age Demographics */}
        <div>
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Age Distribution
          </h3>
          <div className="space-y-2">
            {audienceData.demographics.ageGroups.map((group, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-12">{group.range}</span>
                <div className="flex-1">
                  <Progress value={group.percentage} className="h-2" />
                </div>
                <span className="text-sm font-medium w-8">{group.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Split */}
        <div>
          <h3 className="font-medium text-sm mb-3">Gender Distribution</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded">
              <p className="text-lg font-bold text-pink-600">{audienceData.demographics.gender.female}%</p>
              <p className="text-xs text-muted-foreground">Female</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded">
              <p className="text-lg font-bold text-blue-600">{audienceData.demographics.gender.male}%</p>
              <p className="text-xs text-muted-foreground">Male</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded">
              <p className="text-lg font-bold text-purple-600">{audienceData.demographics.gender.other}%</p>
              <p className="text-xs text-muted-foreground">Other</p>
            </div>
          </div>
        </div>

        {/* Top Locations */}
        <div>
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Locations
          </h3>
          <div className="space-y-2">
            {audienceData.demographics.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{location.country}</span>
                <Badge variant="secondary">{location.percentage}%</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Activity Hours */}
        <div>
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Peak Activity Hours
          </h3>
          <div className="space-y-2">
            {audienceData.behavior.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-16">{hour.time}</span>
                <div className="flex-1">
                  <Progress value={hour.activity} className="h-2" />
                </div>
                <span className="text-sm font-medium w-8">{hour.activity}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interest Categories */}
        <div>
          <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Top Interests
          </h3>
          <div className="space-y-2">
            {audienceData.behavior.interests.map((interest, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm">{interest.topic}</span>
                <div className="flex items-center gap-2">
                  <Progress value={interest.engagement} className="h-1 w-16" />
                  <span className="text-xs font-medium">{interest.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Key Insights
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Your audience is most active between 6-9 PM</p>
            <p>• 77% of your followers are aged 18-34</p>
            <p>• Wellness content gets 92% engagement rate</p>
            <p>• 68% female audience prefers lifestyle content</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
