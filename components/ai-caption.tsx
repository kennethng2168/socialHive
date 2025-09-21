"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown } from "lucide-react"

interface AICaptionProps {
  onCaptionGenerated: (caption: string) => void
}

export function AICaption({ onCaptionGenerated }: AICaptionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([])
  const [selectedCaption, setSelectedCaption] = useState("")

  const generateCaptions = async () => {
    setIsGenerating(true)

    // Simulate AI caption generation
    setTimeout(() => {
      const captions = [
        "Transform your morning routine with these simple hacks that changed my life! ✨ Which one will you try first? #MorningRoutine #ProductivityHacks #LifeHacks",
        "POV: You discover the morning routine that actually works 🌅 Save this for tomorrow morning! #MorningMotivation #Wellness #SelfCare",
        "5 morning habits that will change your entire day (number 3 is a game-changer!) 🔥 #MorningHabits #Productivity #Mindset",
      ]
      setGeneratedCaptions(captions)
      setSelectedCaption(captions[0])
      setIsGenerating(false)
    }, 2000)
  }

  const useCaption = (caption: string) => {
    setSelectedCaption(caption)
    onCaptionGenerated(caption)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI Caption Generator
        </CardTitle>
        <CardDescription>Generate engaging captions optimized for your audience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedCaptions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-medium mb-2">AI-Powered Captions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate multiple caption variations optimized for engagement
            </p>
            <Button onClick={generateCaptions} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedCaptions.map((caption, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedCaption === caption ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedCaption(caption)}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm flex-1">{caption}</p>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {index === 0 ? "Engaging" : index === 1 ? "Trendy" : "Viral"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedCaption === caption ? "default" : "outline"}
                    onClick={() => useCaption(caption)}
                  >
                    Use This
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full bg-transparent" onClick={generateCaptions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
