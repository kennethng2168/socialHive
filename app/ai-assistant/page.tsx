import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Bot, 
  BarChart3, 
  Sparkles, 
  TrendingUp, 
  Film, 
  Camera, 
  Shirt 
} from "lucide-react"

export default function AIAssistantPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Bot className="h-10 w-10 text-purple-600" />
                AI Content Assistant
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your intelligent companion for social media success. Get personalized insights, content strategies, and AI-powered recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Feature Cards */}
              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Smart Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get AI-powered insights into your content performance, audience engagement, and growth opportunities.
                </p>
                <Button asChild className="w-full">
                  <Link href="/analytics">View Analytics</Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Content Ideas</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Discover trending topics, hashtags, and content formats that resonate with your audience.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/ai-inspiration">Get Inspired</Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Trend Analysis</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Stay ahead with real-time trend analysis and predictions for your market and audience.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/trends">Explore Trends</Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Film className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Video Creation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Create stunning videos with AI assistance, from concept to final production.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/ai-tools?tab=video">Create Videos</Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Image Generation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Generate eye-catching images and graphics powered by advanced AI technology.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/ai-tools?tab=image">Generate Images</Link>
                </Button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Shirt className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Virtual Try-On</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Revolutionize fashion content with AI-powered virtual try-on technology.
                </p>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/virtual-try-on">Try Virtual Fitting</Link>
                </Button>
              </div>
            </div>

            {/* AI Chat Interface */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat with AI Assistant</h2>
                <p className="text-gray-600">
                  The floating AI assistant button in the bottom-right corner provides instant help and guidance.
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 max-w-md text-center">
                  <Bot className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Always Available</h3>
                  <p className="text-gray-600 mb-4">
                    Click the floating AI button to get instant help with content strategy, analytics insights, and platform guidance.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                    <Sparkles className="h-4 w-4" />
                    <span>Look for the floating button →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
