"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const data = [
  { name: "Jan", views: 400000, engagement: 2400, followers: 1200 },
  { name: "Feb", views: 300000, engagement: 1398, followers: 2100 },
  { name: "Mar", views: 200000, engagement: 9800, followers: 1800 },
  { name: "Apr", views: 278000, engagement: 3908, followers: 2400 },
  { name: "May", views: 189000, engagement: 4800, followers: 1900 },
  { name: "Jun", views: 239000, engagement: 3800, followers: 2300 },
  { name: "Jul", views: 349000, engagement: 4300, followers: 2600 },
]

export function AnalyticsChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
          <YAxis className="text-xs fill-muted-foreground" axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="hsl(var(--chart-1))"
            fillOpacity={1}
            fill="url(#colorViews)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="engagement"
            stroke="hsl(var(--chart-2))"
            fillOpacity={1}
            fill="url(#colorEngagement)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
