"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Music,
  Search,
  Play,
  Pause,
  Download,
  Heart,
  TrendingUp,
  Clock,
  Volume2,
  Headphones,
  Mic,
  Wand2,
} from "lucide-react"

const soundCategories = [
  { name: "Trending", icon: TrendingUp, count: 1234 },
  { name: "Pop", icon: Music, count: 856 },
  { name: "Hip Hop", icon: Headphones, count: 743 },
  { name: "Electronic", icon: Volume2, count: 621 },
  { name: "Acoustic", icon: Mic, count: 445 },
  { name: "Ambient", icon: Clock, count: 332 },
]

const trendingSounds = [
  {
    id: 1,
    title: "Upbeat Morning Vibes",
    artist: "AudioMaster",
    duration: "0:30",
    uses: "450K",
    category: "Pop",
    trending: true,
    liked: false,
  },
  {
    id: 2,
    title: "Chill Study Beats",
    artist: "LoFiLab",
    duration: "1:00",
    uses: "380K",
    category: "Ambient",
    trending: true,
    liked: true,
  },
  {
    id: 3,
    title: "Workout Energy",
    artist: "FitBeats",
    duration: "0:45",
    uses: "320K",
    category: "Electronic",
    trending: false,
    liked: false,
  },
  {
    id: 4,
    title: "Cooking Background",
    artist: "KitchenTunes",
    duration: "2:00",
    uses: "290K",
    category: "Acoustic",
    trending: false,
    liked: true,
  },
  {
    id: 5,
    title: "Travel Adventure",
    artist: "WanderlustBeats",
    duration: "1:30",
    uses: "275K",
    category: "Pop",
    trending: true,
    liked: false,
  },
  {
    id: 6,
    title: "Night City Vibes",
    artist: "UrbanSounds",
    duration: "0:50",
    uses: "260K",
    category: "Hip Hop",
    trending: false,
    liked: false,
  },
]

export function SoundsLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("Trending")
  const [playingSound, setPlayingSound] = useState<number | null>(null)
  const [likedSounds, setLikedSounds] = useState<number[]>([2, 4])

  const togglePlay = (soundId: number) => {
    setPlayingSound(playingSound === soundId ? null : soundId)
  }

  const toggleLike = (soundId: number) => {
    setLikedSounds((prev) => (prev.includes(soundId) ? prev.filter((id) => id !== soundId) : [...prev, soundId]))
  }

  const filteredSounds =
    selectedCategory === "Trending"
      ? trendingSounds.filter((sound) => sound.trending)
      : trendingSounds.filter((sound) => sound.category === selectedCategory)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Music className="h-6 w-6 text-chart-3" />
              Unlimited Sounds
            </h1>
            <p className="text-sm text-gray-600">Discover and use trending audio for your videos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search sounds..." className="pl-10 w-64" />
            </div>
            <Button className="bg-accent hover:bg-accent/90">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8 pb-8">

      {/* Categories */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {soundCategories.map((category) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <category.icon className="h-4 w-4" />
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* AI Sound Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-accent" />
            AI Sound Generator
          </CardTitle>
          <CardDescription>Create custom audio tracks with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-accent/20 rounded-lg bg-accent/5">
              <h3 className="font-medium text-accent mb-2">Generate Music</h3>
              <p className="text-sm text-muted-foreground mb-3">Create background music from text descriptions</p>
              <Button size="sm" variant="outline">
                Try Now
              </Button>
            </div>
            <div className="p-4 border border-chart-3/20 rounded-lg bg-chart-3/5">
              <h3 className="font-medium text-chart-3 mb-2">Voice Effects</h3>
              <p className="text-sm text-muted-foreground mb-3">Transform your voice with AI effects</p>
              <Button size="sm" variant="outline">
                Explore
              </Button>
            </div>
            <div className="p-4 border border-chart-4/20 rounded-lg bg-chart-4/5">
              <h3 className="font-medium text-chart-4 mb-2">Sound Effects</h3>
              <p className="text-sm text-muted-foreground mb-3">Generate custom sound effects instantly</p>
              <Button size="sm" variant="outline">
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sounds Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedCategory} Sounds ({filteredSounds.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Most Popular
            </Button>
            <Button variant="outline" size="sm">
              Newest
            </Button>
            <Button variant="outline" size="sm">
              Duration
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSounds.map((sound) => (
            <Card key={sound.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-chart-3" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{sound.title}</h3>
                      <p className="text-sm text-muted-foreground">by {sound.artist}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sound.duration}
                        </span>
                        <span className="text-xs text-muted-foreground">{sound.uses} uses</span>
                        <Badge variant="outline" className="text-xs">
                          {sound.category}
                        </Badge>
                        {sound.trending && (
                          <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => togglePlay(sound.id)}>
                      {playingSound === sound.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLike(sound.id)}
                      className={likedSounds.includes(sound.id) ? "text-chart-1" : ""}
                    >
                      <Heart className={`h-4 w-4 ${likedSounds.includes(sound.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-chart-1 hover:bg-chart-1/90">
                      Use Sound
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
