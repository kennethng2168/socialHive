"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Brain, 
  Camera, 
  Video, 
  Mic2, 
  Music, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  GitBranch,
  Target,
  Settings,
  Eye,
  Users,
  Activity,
  Layers
} from "lucide-react"

interface LangGraphNode {
  id: string
  name: string
  type: 'agent' | 'decision' | 'start' | 'end' | 'coordinator'
  agent?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  position: { x: number; y: number }
  description: string
  icon: any
  color: string
  duration?: number
  result?: any
  inputs?: string[]
  outputs?: string[]
}

interface LangGraphEdge {
  id: string
  source: string
  target: string
  condition?: string
  animated?: boolean
  status: 'pending' | 'active' | 'completed'
}

interface WorkflowExecution {
  id: string
  currentNode: string | null
  completedNodes: string[]
  activeEdges: string[]
  progress: number
  startTime: number
  duration: number
  status: 'ready' | 'running' | 'completed' | 'failed'
}

const workflowNodes: LangGraphNode[] = [
  {
    id: 'start',
    name: 'Start Workflow',
    type: 'start',
    status: 'pending',
    position: { x: 100, y: 300 },
    description: 'Initialize content creation workflow',
    icon: Play,
    color: 'bg-green-500',
    outputs: ['coordinator']
  },
  {
    id: 'coordinator',
    name: 'Workflow Coordinator',
    type: 'coordinator',
    status: 'pending',
    position: { x: 350, y: 300 },
    description: 'Coordinates multi-agent workflow execution',
    icon: Workflow,
    color: 'bg-purple-500',
    inputs: ['start'],
    outputs: ['route_decision']
  },
  {
    id: 'route_decision',
    name: 'Route Decision',
    type: 'decision',
    status: 'pending',
    position: { x: 600, y: 300 },
    description: 'Determines which agent to execute next',
    icon: GitBranch,
    color: 'bg-blue-500',
    inputs: ['coordinator'],
    outputs: ['image_agent', 'video_agent', 'lipsync_agent', 'music_agent']
  },
  {
    id: 'image_agent',
    name: 'Image Generation Agent',
    type: 'agent',
    agent: 'ImageGenerationAgent',
    status: 'pending',
    position: { x: 400, y: 150 },
    description: 'Generates or edits images using AI models',
    icon: Camera,
    color: 'bg-pink-500',
    duration: 3,
    inputs: ['route_decision'],
    outputs: ['completion_check']
  },
  {
    id: 'video_agent',
    name: 'Video Generation Agent',
    type: 'agent',
    agent: 'VideoGenerationAgent',
    status: 'pending',
    position: { x: 600, y: 150 },
    description: 'Converts images to videos or creates videos from text',
    icon: Video,
    color: 'bg-blue-600',
    duration: 15,
    inputs: ['route_decision', 'image_agent'],
    outputs: ['completion_check']
  },
  {
    id: 'lipsync_agent',
    name: 'Lipsync Agent',
    type: 'agent',
    agent: 'LipsyncAgent',
    status: 'pending',
    position: { x: 800, y: 150 },
    description: 'Synchronizes audio with video content',
    icon: Mic2,
    color: 'bg-orange-500',
    duration: 10,
    inputs: ['route_decision', 'video_agent'],
    outputs: ['completion_check']
  },
  {
    id: 'music_agent',
    name: 'Music Generation Agent',
    type: 'agent',
    agent: 'MusicGenerationAgent',
    status: 'pending',
    position: { x: 1000, y: 150 },
    description: 'Creates background music and soundtracks',
    icon: Music,
    color: 'bg-green-600',
    duration: 30,
    inputs: ['route_decision'],
    outputs: ['completion_check']
  },
  {
    id: 'completion_check',
    name: 'Completion Check',
    type: 'decision',
    status: 'pending',
    position: { x: 850, y: 300 },
    description: 'Checks if all required steps are completed',
    icon: CheckCircle,
    color: 'bg-cyan-500',
    inputs: ['image_agent', 'video_agent', 'lipsync_agent', 'music_agent'],
    outputs: ['finalizer', 'coordinator']
  },
  {
    id: 'finalizer',
    name: 'Workflow Finalizer',
    type: 'end',
    status: 'pending',
    position: { x: 1100, y: 300 },
    description: 'Finalizes workflow and prepares results',
    icon: Target,
    color: 'bg-gray-600',
    inputs: ['completion_check']
  }
]

const workflowEdges: LangGraphEdge[] = [
  { id: 'e1', source: 'start', target: 'coordinator', status: 'pending' },
  { id: 'e2', source: 'coordinator', target: 'route_decision', status: 'pending' },
  { id: 'e3', source: 'route_decision', target: 'image_agent', condition: 'first_step', status: 'pending' },
  { id: 'e4', source: 'image_agent', target: 'completion_check', status: 'pending' },
  { id: 'e5', source: 'route_decision', target: 'video_agent', condition: 'after_image', status: 'pending' },
  { id: 'e6', source: 'video_agent', target: 'completion_check', status: 'pending' },
  { id: 'e7', source: 'route_decision', target: 'lipsync_agent', condition: 'after_video', status: 'pending' },
  { id: 'e8', source: 'lipsync_agent', target: 'completion_check', status: 'pending' },
  { id: 'e9', source: 'route_decision', target: 'music_agent', condition: 'parallel', status: 'pending' },
  { id: 'e10', source: 'music_agent', target: 'completion_check', status: 'pending' },
  { id: 'e11', source: 'completion_check', target: 'coordinator', condition: 'continue', status: 'pending' },
  { id: 'e12', source: 'completion_check', target: 'finalizer', condition: 'complete', status: 'pending' }
]

const workflowTemplates = [
  {
    id: 'complete',
    name: 'Complete Content Creation',
    description: 'Image → Video → Lipsync → Music',
    steps: ['image_agent', 'video_agent', 'lipsync_agent', 'music_agent'],
    estimatedTime: 58
  },
  {
    id: 'image_to_video',
    name: 'Image to Video',
    description: 'Image → Video',
    steps: ['image_agent', 'video_agent'],
    estimatedTime: 18
  },
  {
    id: 'music_video',
    name: 'Music Video Creation',
    description: 'Image → Video → Music → Lipsync',
    steps: ['image_agent', 'video_agent', 'music_agent', 'lipsync_agent'],
    estimatedTime: 53
  }
]

export function LangGraphWorkflowVisualizer() {
  const [nodes, setNodes] = useState<LangGraphNode[]>(workflowNodes)
  const [edges, setEdges] = useState<LangGraphEdge[]>(workflowEdges)
  const [execution, setExecution] = useState<WorkflowExecution>({
    id: 'workflow_1',
    currentNode: null,
    completedNodes: [],
    activeEdges: [],
    progress: 0,
    startTime: 0,
    duration: 0,
    status: 'ready'
  })
  const [selectedTemplate, setSelectedTemplate] = useState(workflowTemplates[0])
  const [zoom, setZoom] = useState(0.8)
  const [showLegend, setShowLegend] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [realWorkflowMode, setRealWorkflowMode] = useState(false)
  const [workflowPrompt, setWorkflowPrompt] = useState("A majestic eagle soaring over snow-capped mountains at sunrise")

  const canvasRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  const resetWorkflow = useCallback(() => {
    setExecution({
      id: `workflow_${Date.now()}`,
      currentNode: null,
      completedNodes: [],
      activeEdges: [],
      progress: 0,
      startTime: 0,
      duration: 0,
      status: 'ready'
    })
    setNodes(nodes.map(node => ({ ...node, status: 'pending' })))
    setEdges(edges.map(edge => ({ ...edge, status: 'pending', animated: false })))
  }, [nodes, edges])

  const executeWorkflowStep = useCallback((stepIndex: number, templateSteps: string[]) => {
    if (stepIndex >= templateSteps.length) {
      // Complete workflow
      setExecution(prev => ({
        ...prev,
        currentNode: 'finalizer',
        completedNodes: [...prev.completedNodes, 'finalizer'],
        status: 'completed',
        progress: 100
      }))
      setNodes(prev => prev.map(node => 
        node.id === 'finalizer' 
          ? { ...node, status: 'completed' }
          : node
      ))
      return
    }

    const currentStepId = templateSteps[stepIndex]
    const currentNode = nodes.find(n => n.id === currentStepId)
    
    if (!currentNode) return

    // Start current step
    setExecution(prev => ({
      ...prev,
      currentNode: currentStepId,
      progress: (stepIndex / templateSteps.length) * 100
    }))
    
    setNodes(prev => prev.map(node => 
      node.id === currentStepId 
        ? { ...node, status: 'running' }
        : node
    ))

    // Activate relevant edges
    const relevantEdges = edges.filter(edge => 
      edge.source === currentStepId || edge.target === currentStepId
    )
    setEdges(prev => prev.map(edge => 
      relevantEdges.some(e => e.id === edge.id)
        ? { ...edge, status: 'active', animated: true }
        : edge
    ))

    // Simulate processing time
    const processingTime = (currentNode.duration || 2) * 1000 / animationSpeed
    
    setTimeout(() => {
      // Complete current step
      setNodes(prev => prev.map(node => 
        node.id === currentStepId 
          ? { ...node, status: 'completed' }
          : node
      ))
      
      setEdges(prev => prev.map(edge => 
        relevantEdges.some(e => e.id === edge.id)
          ? { ...edge, status: 'completed', animated: false }
          : edge
      ))

      setExecution(prev => ({
        ...prev,
        completedNodes: [...prev.completedNodes, currentStepId]
      }))

      // Move to next step
      setTimeout(() => {
        executeWorkflowStep(stepIndex + 1, templateSteps)
      }, 500 / animationSpeed)
      
    }, processingTime)
  }, [nodes, edges, animationSpeed])

  const startWorkflow = useCallback(async () => {
    if (execution.status === 'running') return

    setExecution(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now(),
      currentNode: 'start',
      completedNodes: ['start'],
      progress: 0
    }))

    // Start with coordinator
    setNodes(prev => prev.map(node => 
      node.id === 'start' 
        ? { ...node, status: 'completed' }
        : node.id === 'coordinator'
        ? { ...node, status: 'running' }
        : node
    ))

    // Activate start edge
    setEdges(prev => prev.map(edge => 
      edge.source === 'start' 
        ? { ...edge, status: 'active', animated: true }
        : edge
    ))

    setTimeout(() => {
      setNodes(prev => prev.map(node => 
        node.id === 'coordinator' 
          ? { ...node, status: 'completed' }
          : node
      ))
      
      setEdges(prev => prev.map(edge => 
        edge.source === 'start' 
          ? { ...edge, status: 'completed', animated: false }
          : edge.source === 'coordinator'
          ? { ...edge, status: 'active', animated: true }
          : edge
      ))
      
      setExecution(prev => ({
        ...prev,
        completedNodes: [...prev.completedNodes, 'coordinator']
      }))

      // Start executing template steps
      setTimeout(() => {
        executeWorkflowStep(0, selectedTemplate.steps)
      }, 500 / animationSpeed)
    }, 1000 / animationSpeed)
  }, [execution.status, selectedTemplate, executeWorkflowStep, animationSpeed])

  const pauseWorkflow = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    setExecution(prev => ({ ...prev, status: 'ready' }))
  }, [])

  const startRealWorkflow = useCallback(async () => {
    if (!workflowPrompt.trim()) return

    setExecution(prev => ({
      ...prev,
      status: 'running',
      startTime: Date.now(),
      currentNode: 'start',
      completedNodes: ['start'],
      progress: 0
    }))

    // Start visual workflow immediately
    setNodes(prev => prev.map(node => 
      node.id === 'start' 
        ? { ...node, status: 'completed' }
        : node.id === 'coordinator'
        ? { ...node, status: 'running' }
        : node
    ))

    try {
      // Call the Python backend directly for real multi-agent execution
      const pythonEndpoint = 'http://127.0.0.1:8000'
      
      console.log('🐍 Calling Python multi-agent backend...')
      const response = await fetch(`${pythonEndpoint}/workflow/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: workflowPrompt.trim(),
          workflow_type: selectedTemplate.id,
          user_id: 'langgraph_demo'
        }),
      })

      if (!response.ok) {
        throw new Error(`Python backend error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('🤖 Python multi-agent response:', result)
      
      // Update coordinator to completed
      setTimeout(() => {
        setNodes(prev => prev.map(node => 
          node.id === 'coordinator' 
            ? { ...node, status: 'completed' }
            : node
        ))
        setExecution(prev => ({
          ...prev,
          completedNodes: [...prev.completedNodes, 'coordinator']
        }))
      }, 1000)

      // Process real step details from Python backend
      if (result.step_details) {
        const stepMapping: Record<string, string> = {
          'image_generation': 'image_agent',
          'video_generation': 'video_agent', 
          'lipsync_generation': 'lipsync_agent',
          'music_generation': 'music_agent'
        }

        // Process each step with real timing
        result.step_details.forEach((step: any, index: number) => {
          const nodeId = stepMapping[step.step]
          if (nodeId) {
            setTimeout(() => {
              console.log(`🎯 Starting ${step.step}...`)
              setNodes(prev => prev.map(node => 
                node.id === nodeId 
                  ? { ...node, status: 'running', result: step.result }
                  : node
              ))
              
              setExecution(prev => ({
                ...prev,
                currentNode: nodeId,
                progress: ((index + 1) / result.step_details.length) * 80 // 80% for steps, 20% for finalization
              }))
              
              // Complete the step
              setTimeout(() => {
                console.log(`✅ Completed ${step.step}`)
                setNodes(prev => prev.map(node => 
                  node.id === nodeId 
                    ? { ...node, status: step.status === 'completed' ? 'completed' : 'failed' }
                    : node
                ))
                
                setExecution(prev => ({
                  ...prev,
                  completedNodes: [...prev.completedNodes, nodeId]
                }))
              }, 2000) // 2 second processing visualization
            }, index * 3000 + 2000) // Stagger steps + coordinator delay
          }
        })

        // Complete entire workflow
        const totalTime = result.step_details.length * 3000 + 4000
        setTimeout(() => {
          console.log('🎉 Workflow completed!')
          setNodes(prev => prev.map(node => 
            node.id === 'finalizer' 
              ? { ...node, status: 'completed' }
              : node
          ))
          
          setExecution(prev => ({
            ...prev,
            status: result.success ? 'completed' : 'failed',
            progress: 100,
            currentNode: 'finalizer',
            completedNodes: [...prev.completedNodes, 'finalizer']
          }))
        }, totalTime)
      }

    } catch (error) {
      console.error('❌ Real workflow error:', error)
      
      // Show error in UI
      setNodes(prev => prev.map(node => 
        node.status === 'running' 
          ? { ...node, status: 'failed' }
          : node
      ))
      
      setExecution(prev => ({ 
        ...prev, 
        status: 'failed',
        currentNode: null
      }))
      
      // Try fallback to Next.js API (demo mode)
      console.log('🔄 Falling back to Next.js demo mode...')
      try {
        const fallbackResponse = await fetch('/api/content-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: workflowPrompt.trim(),
            workflow_type: selectedTemplate.id,
            user_id: 'langgraph_demo_fallback'
          }),
        })
        
        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json()
          console.log('📱 Fallback demo mode executed successfully')
          
          // Reset and run demo visualization
          setTimeout(() => {
            setExecution(prev => ({ ...prev, status: 'ready' }))
            setNodes(prev => prev.map(node => ({ ...node, status: 'pending' })))
            executeWorkflowStep(0, selectedTemplate.steps)
          }, 1000)
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
      }
    }
  }, [workflowPrompt, selectedTemplate, executeWorkflowStep])

  const getEdgePath = useCallback((edge: LangGraphEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return ''

    const sourceX = sourceNode.position.x + 120 // Center of node
    const sourceY = sourceNode.position.y + 40
    const targetX = targetNode.position.x + 120
    const targetY = targetNode.position.y + 40

    // Calculate control points for smooth curves
    const deltaX = targetX - sourceX
    const deltaY = targetY - sourceY
    const controlOffset = Math.abs(deltaX) * 0.5

    return `M ${sourceX} ${sourceY} C ${sourceX + controlOffset} ${sourceY}, ${targetX - controlOffset} ${targetY}, ${targetX} ${targetY}`
  }, [nodes])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (execution.status === 'running') {
      interval = setInterval(() => {
        setExecution(prev => ({
          ...prev,
          duration: (Date.now() - prev.startTime) / 1000
        }))
      }, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [execution.status, execution.startTime])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LangGraph Multi-Agent Workflow</h1>
                <p className="text-sm text-gray-600">Content Creation Orchestration System</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
              ReAct Framework
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
              <span className="text-sm font-medium text-gray-600">Speed:</span>
              <select 
                value={animationSpeed} 
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="text-sm bg-white border border-gray-300 rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
              </select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowLegend(!showLegend)}
              className={showLegend ? "bg-blue-50 border-blue-300" : ""}
            >
              <Eye className="h-4 w-4 mr-2" />
              Legend
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Controls */}
        <div className="w-80 border-r border-gray-200 bg-white/50 backdrop-blur-sm p-6 space-y-6">
          {/* Workflow Template Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Workflow Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflowTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{template.estimatedTime}s
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Execution Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Workflow className="h-5 w-5 text-green-600" />
                Execution Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="realMode"
                  checked={realWorkflowMode}
                  onChange={(e) => setRealWorkflowMode(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="realMode" className="text-sm font-medium">
                  Real API Mode
                </label>
              </div>

              {/* Workflow Prompt (for real mode) */}
              {realWorkflowMode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Content Prompt
                  </label>
                  <textarea
                    value={workflowPrompt}
                    onChange={(e) => setWorkflowPrompt(e.target.value)}
                    placeholder="Describe the content you want to create..."
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={realWorkflowMode ? startRealWorkflow : startWorkflow}
                  disabled={execution.status === 'running' || (realWorkflowMode && !workflowPrompt.trim())}
                  className={`flex-1 ${realWorkflowMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-green-600 hover:bg-green-700'}`}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {realWorkflowMode ? 'Run Real Workflow' : 'Start Demo'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={pauseWorkflow}
                  disabled={execution.status !== 'running'}
                  size="sm"
                >
                  <Pause className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetWorkflow}
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {execution.status !== 'ready' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(execution.progress)}%</span>
                    </div>
                    <Progress value={execution.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="font-medium capitalize">{execution.status}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="font-medium">{formatDuration(execution.duration)}</div>
                    </div>
                  </div>

                  {execution.currentNode && (
                    <div>
                      <div className="text-gray-500 text-sm">Current Step</div>
                      <div className="font-medium text-sm">
                        {nodes.find(n => n.id === execution.currentNode)?.name}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Agent Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nodes.filter(n => n.type === 'agent').map((node) => {
                const IconComponent = node.icon
                return (
                  <div key={node.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{node.agent}</div>
                      <div className="text-xs text-gray-500">
                        {node.duration}s processing time
                      </div>
                    </div>
                    <div className="flex items-center">
                      {node.status === 'pending' && (
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      )}
                      {node.status === 'running' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      {node.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {node.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Workflow Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(156,163,175,0.15) 1px, transparent 0)
              `,
              backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            }}
          >
            <div 
              className="relative w-full h-full"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left'
              }}
            >
              {/* SVG for connections */}
              <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-completed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                </defs>
                
                {edges.map((edge) => (
                  <g key={edge.id}>
                    <path
                      d={getEdgePath(edge)}
                      stroke={
                        edge.status === 'completed' ? '#10b981' :
                        edge.status === 'active' ? '#3b82f6' : '#9ca3af'
                      }
                      strokeWidth={edge.status === 'active' ? "3" : "2"}
                      fill="none"
                      markerEnd={
                        edge.status === 'completed' ? "url(#arrowhead-completed)" :
                        edge.status === 'active' ? "url(#arrowhead-active)" : "url(#arrowhead)"
                      }
                      strokeDasharray={edge.animated ? "8,4" : "none"}
                      className={edge.animated ? "animate-pulse" : ""}
                    />
                    {edge.condition && (
                      <text
                        x={nodes.find(n => n.id === edge.source)?.position.x! + 150}
                        y={nodes.find(n => n.id === edge.source)?.position.y! + 30}
                        className="text-xs fill-gray-500"
                        textAnchor="middle"
                      >
                        {edge.condition}
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* Workflow Nodes */}
              {nodes.map((node) => {
                const IconComponent = node.icon
                return (
                  <div
                    key={node.id}
                    className={`absolute w-60 rounded-xl border-2 transition-all duration-300 shadow-lg bg-white ${
                      node.status === 'running' 
                        ? 'border-blue-400 shadow-xl shadow-blue-200/50 scale-105 animate-pulse' 
                        : node.status === 'completed'
                        ? 'border-green-400 shadow-xl shadow-green-200/50'
                        : node.status === 'failed'
                        ? 'border-red-400 shadow-xl shadow-red-200/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                    }}
                  >
                    <div className={`h-12 rounded-t-xl ${node.color} px-4 flex items-center justify-between relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white truncate">{node.name}</span>
                      </div>
                      <div className="relative z-10">
                        {node.status === 'running' && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                        {node.status === 'completed' && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        {node.status === 'failed' && (
                          <AlertCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="text-sm text-gray-600">{node.description}</div>
                      
                      {node.type === 'agent' && (
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Processing time: {node.duration}s
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${
                            node.status === 'running' ? 'border-blue-400 text-blue-700' :
                            node.status === 'completed' ? 'border-green-400 text-green-700' :
                            node.status === 'failed' ? 'border-red-400 text-red-700' :
                            'border-gray-300 text-gray-600'
                          }`}
                        >
                          {node.status}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {node.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              className="h-8 w-8 p-0"
            >
              <span className="text-lg">−</span>
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
              className="h-8 w-8 p-0"
            >
              <span className="text-lg">+</span>
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Legend & Info */}
        {showLegend && (
          <div className="w-72 border-l border-gray-200 bg-white/50 backdrop-blur-sm p-6 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-3">Node Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Start/End Nodes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm">Coordinator</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Decision Nodes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span className="text-sm">Agent Nodes</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Status Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Running</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-sm">Failed</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Edge States</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-0.5 bg-gray-400"></div>
                      <span className="text-sm">Inactive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-0.5 bg-blue-500"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-0.5 bg-green-500"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">ReAct Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Reasoning:</strong> Agents analyze the current situation and context</p>
                  <p><strong>Acting:</strong> Agents take specific actions based on their reasoning</p>
                  <p><strong>Observing:</strong> Agents evaluate the results of their actions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}