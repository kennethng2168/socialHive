"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Mic2,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Share2,
  Wand2
} from 'lucide-react'

interface WorkflowStep {
  step: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  estimated_time?: string
  result?: {
    asset_id: string
    asset_type: string
    url: string
    metadata: any
  }
}

interface WorkflowResult {
  success: boolean
  workflow_id: string
  workflow_type: string
  user_prompt: string
  success_rate: number
  completed_steps: string[]
  generated_assets: Record<string, string>
  total_processing_time: number
  workflow_status: string
  step_details: WorkflowStep[]
  metadata: any
}

const workflowTypes = [
  {
    type: "complete",
    name: "Complete Content Creation",
    description: "Image → Video → Lipsync → Music",
    icon: Sparkles,
    estimatedTime: "50-60 seconds",
    steps: ["Image Generation", "Video Creation", "Lipsync", "Music"]
  },
  {
    type: "image_to_video",
    name: "Image to Video",
    description: "Generate image then convert to video",
    icon: Video,
    estimatedTime: "15-20 seconds", 
    steps: ["Image Generation", "Video Creation"]
  },
  {
    type: "music_video",
    name: "Music Video Creation",
    description: "Create a complete music video with soundtrack",
    icon: Music,
    estimatedTime: "45-55 seconds",
    steps: ["Image Generation", "Video Creation", "Music", "Lipsync"]
  }
]

const stepIcons: Record<string, any> = {
  'image_generation': ImageIcon,
  'video_generation': Video,
  'lipsync_generation': Mic2,
  'music_generation': Music
}

const stepNames: Record<string, string> = {
  'image_generation': 'Image Generation',
  'video_generation': 'Video Generation', 
  'lipsync_generation': 'Lipsync',
  'music_generation': 'Music Generation'
}

export default function ContentWorkflowStudio() {
  const [prompt, setPrompt] = useState('')
  const [workflowType, setWorkflowType] = useState('complete')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<WorkflowResult | null>(null)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isGenerating) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    } else {
      setTimeElapsed(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setResult(null)
    setCurrentStep(null)
    setProgress(0)

    try {
      const response = await fetch('/api/content-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          workflow_type: workflowType,
          user_id: 'demo_user'
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const workflowResult = await response.json()
      setResult(workflowResult)

      // Simulate progress updates during processing
      if (workflowResult.step_details) {
        const totalSteps = workflowResult.step_details.length
        workflowResult.step_details.forEach((step: WorkflowStep, index: number) => {
          setTimeout(() => {
            setCurrentStep(step.step)
            setProgress(((index + 1) / totalSteps) * 100)
          }, index * 1000)
        })
      }

    } catch (error) {
      console.error('Content workflow error:', error)
      setResult({
        success: false,
        workflow_id: '',
        workflow_type: workflowType,
        user_prompt: prompt,
        success_rate: 0,
        completed_steps: [],
        generated_assets: {},
        total_processing_time: 0,
        workflow_status: 'failed',
        step_details: [],
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedWorkflow = workflowTypes.find(w => w.type === workflowType)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Wand2 className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Content Workflow Studio
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create complete content workflows with AI agents: from image generation to video creation, lipsync, and music generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Configuration */}
          <div className="space-y-6">
            {/* Workflow Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Workflow Type
                </CardTitle>
                <CardDescription>
                  Choose your content creation workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {workflowTypes.map((workflow) => {
                    const IconComponent = workflow.icon
                    return (
                      <div
                        key={workflow.type}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          workflowType === workflow.type
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setWorkflowType(workflow.type)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`h-5 w-5 mt-0.5 ${
                            workflowType === workflow.type ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{workflow.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {workflow.estimatedTime}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                            <div className="flex gap-1 mt-2">
                              {workflow.steps.map((step, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {step}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Content Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Content Prompt
                </CardTitle>
                <CardDescription>
                  Describe the content you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Main Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe your vision... (e.g., 'A serene mountain landscape at sunset with golden light reflecting on a calm lake')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    💡 Be descriptive and specific for better results across all content types
                  </p>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Content... {formatTime(timeElapsed)}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Workflow
                    </>
                  )}
                </Button>

                {selectedWorkflow && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Selected Workflow:</div>
                    <div className="text-sm text-gray-600">{selectedWorkflow.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Estimated time: {selectedWorkflow.estimatedTime}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Results and Progress */}
          <div className="space-y-6">
            {/* Progress Card */}
            {isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    Workflow Progress
                  </CardTitle>
                  <CardDescription>
                    AI agents are working on your content...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {currentStep && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Current: {stepNames[currentStep] || currentStep}
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-2xl font-mono">{formatTime(timeElapsed)}</div>
                    <div className="text-xs text-gray-500">Time Elapsed</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Card */}
            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Workflow Results
                  </CardTitle>
                  <CardDescription>
                    {result.success 
                      ? `Successfully completed ${result.completed_steps.length} steps`
                      : 'Workflow encountered errors'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Workflow Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Success Rate</div>
                      <div className="font-medium">{Math.round(result.success_rate * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Processing Time</div>
                      <div className="font-medium">{result.total_processing_time.toFixed(1)}s</div>
                    </div>
                  </div>

                  {/* Step Details */}
                  {result.step_details && result.step_details.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Step Details:</h4>
                      {result.step_details.map((step, index) => {
                        const StepIcon = stepIcons[step.step] || AlertCircle
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <StepIcon className="h-4 w-4 text-gray-600" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {stepNames[step.step] || step.step}
                              </div>
                              {step.estimated_time && (
                                <div className="text-xs text-gray-500">
                                  Estimated: {step.estimated_time}
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant={step.status === 'completed' ? 'default' : 
                                      step.status === 'failed' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {step.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Generated Assets */}
                  {result.generated_assets && Object.keys(result.generated_assets).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Generated Assets:</h4>
                      <div className="grid gap-3">
                        {Object.entries(result.generated_assets).map(([assetType, url]) => {
                          const isImage = assetType === 'image'
                          const isVideo = assetType === 'video' || assetType === 'lipsync_video'
                          const isAudio = assetType === 'audio'

                          return (
                            <div key={assetType} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {isImage && <ImageIcon className="h-4 w-4 text-blue-600" />}
                                  {isVideo && <Video className="h-4 w-4 text-purple-600" />}
                                  {isAudio && <Music className="h-4 w-4 text-green-600" />}
                                  <span className="font-medium capitalize text-sm">
                                    {assetType.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" className="h-7 px-2">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 px-2">
                                    <Share2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {isImage && (
                                <div className="bg-gray-100 rounded-lg p-2 text-center">
                                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">Generated Image Preview</p>
                                </div>
                              )}
                              
                              {isVideo && (
                                <div className="bg-gray-100 rounded-lg p-2 text-center">
                                  <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                    <Video className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">Generated Video Preview</p>
                                </div>
                              )}
                              
                              {isAudio && (
                                <div className="bg-gray-100 rounded-lg p-2 text-center">
                                  <div className="w-full h-16 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                                    <Music className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">Generated Music Preview</p>
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-400 mt-1 truncate">{url}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {!result.success && result.metadata?.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800">Error Details:</div>
                      <div className="text-sm text-red-600 mt-1">{result.metadata.error}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isGenerating && !result && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Ready to Create</h3>
                  <p className="text-gray-500 text-sm max-w-sm">
                    Enter a prompt and select a workflow type to start creating content with our AI agents
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}