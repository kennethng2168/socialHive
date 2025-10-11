"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles,
  Image as ImageIcon, 
  Video, 
  FileText,
  Loader2,
  Download,
  Upload,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Copy
} from 'lucide-react'

interface SmartCreativeResult {
  success: boolean
  intent: 'generate_image' | 'generate_copy' | 'generate_video' | 'hybrid'
  assets: {
    image?: {
      url: string
      s3_bucket: string
      type: string
    }
    copywriting?: string
    video?: {
      url: string
      s3_bucket: string
      type: string
    }
  }
  s3_assets?: any[]
  error?: string
  guardrails?: any
}

export default function SmartCreativeStudio() {
  const [prompt, setPrompt] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('en')
  const [s3Bucket, setS3Bucket] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<SmartCreativeResult | null>(null)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown')

  // Check API health on mount
  useEffect(() => {
    fetch('/api/smart-creative')
      .then(res => res.json())
      .then(data => {
        setApiStatus(data.external_api_healthy ? 'healthy' : 'unhealthy')
      })
      .catch(() => setApiStatus('unhealthy'))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('target_language', targetLanguage)
      
      if (s3Bucket) {
        formData.append('s3_bucket', s3Bucket)
      }
      
      if (imageFile) {
        formData.append('file', imageFile)
      }

      const response = await fetch('/api/smart-creative', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResult(data)

    } catch (error) {
      console.error('Smart Creative error:', error)
      setResult({
        success: false,
        intent: 'generate_image',
        assets: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'generate_image':
        return <ImageIcon className="h-5 w-5" />
      case 'generate_video':
        return <Video className="h-5 w-5" />
      case 'generate_copy':
        return <FileText className="h-5 w-5" />
      case 'hybrid':
        return <Sparkles className="h-5 w-5" />
      default:
        return <Wand2 className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Smart Creative Studio</h1>
            <p className="text-muted-foreground">
              AI-powered all-in-one content creator with Amazon Nova
            </p>
          </div>
        </div>
        
        {/* API Status */}
        <div className="flex items-center gap-2 mt-4">
          <Badge variant={apiStatus === 'healthy' ? 'default' : apiStatus === 'unhealthy' ? 'destructive' : 'secondary'}>
            {apiStatus === 'healthy' ? '✓ AI Agent Connected' : 
             apiStatus === 'unhealthy' ? '✗ AI Agent Offline' : 
             '○ Checking...'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create Content</CardTitle>
            <CardDescription>
              Describe what you want - images, videos, copywriting, or any combination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">What do you want to create?</Label>
              <Textarea
                id="prompt"
                placeholder="Examples:
• Create an elegant hijab fashion image with modern styling
• Write social media copy for a luxury brand campaign
• Generate a video showcasing modest fashion trends
• Create image and copywriting for product launch"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ms">Malay</SelectItem>
                  <SelectItem value="id">Indonesian</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Reference Image (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {imageFile && (
                  <Badge variant="secondary">
                    {imageFile.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image for copywriting or as a reference
              </p>
            </div>

            {/* S3 Bucket (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="s3bucket">S3 Bucket (Optional)</Label>
              <Input
                id="s3bucket"
                placeholder="my-content-bucket"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Specify a custom S3 bucket for asset storage
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated assets will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !isGenerating && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Wand2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter your creative prompt and click "Generate Content" to get started
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">
                  AI is creating your content...
                </p>
              </div>
            )}

            {result && (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {/* Success/Error Alert */}
                  {result.success ? (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center gap-2">
                          {getIntentIcon(result.intent)}
                          <span className="font-medium">
                            {result.intent.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.error || 'Generation failed'}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Generated Image */}
                  {result.assets?.image && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Generated Image
                          </CardTitle>
                          <a
                            href={result.assets.image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <img
                          src={result.assets.image.url}
                          alt="Generated"
                          className="w-full rounded-lg"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>S3 Bucket: {result.assets.image.s3_bucket}</p>
                          <p className="break-all">URL: {result.assets.image.url}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Generated Video */}
                  {result.assets?.video && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Generated Video
                          </CardTitle>
                          <a
                            href={result.assets.video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <video
                          src={result.assets.video.url}
                          controls
                          className="w-full rounded-lg"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>S3 Bucket: {result.assets.video.s3_bucket}</p>
                          <p className="break-all">URL: {result.assets.video.url}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Generated Copywriting */}
                  {result.assets?.copywriting && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Generated Copy
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(result.assets.copywriting!)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                          {result.assets.copywriting}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* S3 Assets List */}
                  {result.s3_assets && result.s3_assets.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">S3 Assets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {result.s3_assets.map((asset: any, index: number) => (
                            <div
                              key={index}
                              className="p-2 bg-muted rounded text-xs break-all"
                            >
                              {JSON.stringify(asset, null, 2)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Examples Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Example Prompts</CardTitle>
          <CardDescription>
            Try these example prompts to see what the AI can create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => setPrompt("Create an elegant hijab fashion image with modern styling and pastel colors")}
            >
              <ImageIcon className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold text-sm">Image Generation</div>
                <div className="text-xs text-muted-foreground">
                  Create fashion imagery
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => setPrompt("Write social media copy for a luxury modest fashion brand launching a new collection")}
            >
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold text-sm">Copywriting</div>
                <div className="text-xs text-muted-foreground">
                  Generate marketing copy
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => setPrompt("Create a 15-second video showcasing modern modest fashion trends with elegant transitions")}
            >
              <Video className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-semibold text-sm">Video Creation</div>
                <div className="text-xs text-muted-foreground">
                  Generate video content
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => setPrompt("Create elegant fashion image, then write luxury brand copywriting for Instagram")}
            >
              <Sparkles className="h-5 w-5 text-pink-500" />
              <div className="text-left">
                <div className="font-semibold text-sm">Hybrid Content</div>
                <div className="text-xs text-muted-foreground">
                  Image + Copy + Video
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

