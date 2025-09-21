"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, CalendarIcon, TrendingUp, Users, Zap } from "lucide-react"

const optimalTimes = [
  { time: "7:00 PM", engagement: "High", audience: "2.4M active" },
  { time: "8:30 PM", engagement: "Peak", audience: "3.1M active" },
  { time: "9:15 PM", engagement: "High", audience: "2.8M active" },
]

export function SmartScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("8:30 PM")
  const [autoSchedule, setAutoSchedule] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Smart Scheduler
        </CardTitle>
        <CardDescription>Schedule your post for optimal engagement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-schedule">AI-Optimized Scheduling</Label>
            <p className="text-xs text-muted-foreground">Let AI choose the best time based on your audience</p>
          </div>
          <Switch id="auto-schedule" checked={autoSchedule} onCheckedChange={setAutoSchedule} />
        </div>

        {autoSchedule ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">AI Recommendations</span>
              <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                Based on your audience
              </Badge>
            </div>

            <div className="grid gap-3">
              {optimalTimes.map((slot, index) => (
                <div
                  key={slot.time}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTime === slot.time ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTime(slot.time)}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{slot.time}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{slot.engagement} engagement</span>
                        <Users className="h-3 w-3 ml-2" />
                        <span>{slot.audience}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={slot.engagement === "Peak" ? "default" : "secondary"}
                    className={slot.engagement === "Peak" ? "bg-accent text-accent-foreground" : ""}
                  >
                    {slot.engagement}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Time</Label>
              <div className="grid grid-cols-2 gap-2">
                {["6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM", "11:00 PM"].map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Scheduled for:</p>
              <p className="text-sm text-muted-foreground">
                {selectedDate?.toLocaleDateString()} at {selectedTime}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
