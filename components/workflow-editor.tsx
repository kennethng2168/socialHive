"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Workflow,
  Video,
  ImageIcon,
  Music,
  Type,
  Layers,
  Play,
  Download,
  Save,
  Undo,
  Redo,
  Wand2,
  Trash2,
  Zap,
  Brain,
  Mic,
  Filter,
  Plus,
  ZoomIn,
  ZoomOut,
  Move,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
} from "lucide-react"

interface Connection {
  id: string
  sourceNodeId: string
  sourcePort: string
  targetNodeId: string
  targetPort: string
}

interface WorkflowNode {
  id: string
  type: "video" | "image" | "audio" | "text" | "effect" | "ai-generate" | "ai-enhance" | "condition" | "merge"
  title: string
  duration?: number
  position: { x: number; y: number }
  inputs: string[]
  outputs: string[]
  data?: any
}

const initialNodes: WorkflowNode[] = [
  {
    id: "1",
    type: "ai-generate",
    title: "AI Video Generator",
    position: { x: 100, y: 100 },
    inputs: ["prompt"],
    outputs: ["video"],
  },
  {
    id: "2",
    type: "text",
    title: "Title Overlay",
    duration: 3,
    position: { x: 400, y: 150 },
    inputs: ["video", "text"],
    outputs: ["video"],
  },
  {
    id: "3",
    type: "ai-enhance",
    title: "AI Enhancer",
    position: { x: 700, y: 100 },
    inputs: ["video"],
    outputs: ["video"],
  },
]

const initialConnections: Connection[] = []

const nodeTypes = [
  { type: "video", icon: Video, label: "Video Input", color: "bg-blue-500", inputs: [], outputs: ["video"] },
  { type: "image", icon: ImageIcon, label: "Image Input", color: "bg-green-500", inputs: [], outputs: ["image"] },
  { type: "audio", icon: Music, label: "Audio Input", color: "bg-yellow-500", inputs: [], outputs: ["audio"] },
  {
    type: "text",
    icon: Type,
    label: "Text Overlay",
    color: "bg-purple-500",
    inputs: ["video", "text"],
    outputs: ["video"],
  },
  { type: "effect", icon: Wand2, label: "Effect", color: "bg-pink-500", inputs: ["video"], outputs: ["video"] },
  {
    type: "ai-generate",
    icon: Brain,
    label: "AI Generator",
    color: "bg-indigo-500",
    inputs: ["prompt"],
    outputs: ["video", "image", "audio"],
  },
  {
    type: "ai-enhance",
    icon: Zap,
    label: "AI Enhancer",
    color: "bg-cyan-500",
    inputs: ["video", "image"],
    outputs: ["video", "image"],
  },
  {
    type: "condition",
    icon: Filter,
    label: "Condition",
    color: "bg-orange-500",
    inputs: ["input"],
    outputs: ["true", "false"],
  },
  {
    type: "merge",
    icon: Layers,
    label: "Merge",
    color: "bg-red-500",
    inputs: ["input1", "input2"],
    outputs: ["output"],
  },
]

export function WorkflowEditor() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes)
  const [connections, setConnections] = useState<Connection[]>(initialConnections)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState<{ nodeId: string; port: string; type: "input" | "output" } | null>(
    null,
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration] = useState(30)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [dragConnection, setDragConnection] = useState<{ x: number; y: number } | null>(null)
  const [showPortMenu, setShowPortMenu] = useState<{
    nodeId: string
    port: string
    type: "input" | "output"
    x: number
    y: number
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [connectionStart, setConnectionStart] = useState<{ x: number; y: number; nodeId: string; port: string } | null>(
    null,
  )
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, nodeId?: string) => {
      e.preventDefault()

      if (nodeId) {
        const node = nodes.find((n) => n.id === nodeId)
        if (!node) return

        setIsDragging(true)
        setDraggedNode(nodeId)
        setSelectedNode(nodeId)
        setDragStartPos({ x: e.clientX, y: e.clientY })
        setDragOffset({
          x: e.clientX - node.position.x * zoom - pan.x,
          y: e.clientY - node.position.y * zoom - pan.y,
        })
      } else {
        setIsPanning(true)
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [nodes, zoom, pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      if (draggedNode && isDragging) {
        const newPosition = {
          x: Math.round((e.clientX - dragOffset.x - pan.x) / zoom / 10) * 10,
          y: Math.round((e.clientY - dragOffset.y - pan.y) / zoom / 10) * 10,
        }
        setNodes((prev) => prev.map((node) => (node.id === draggedNode ? { ...node, position: newPosition } : node)))
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      } else if (isConnecting) {
        setDragConnection({ x: e.clientX, y: e.clientY })
      }
    },
    [draggedNode, isDragging, dragOffset, isPanning, panStart, isConnecting, zoom, pan],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null)
    setIsDragging(false)
    setIsPanning(false)
    setDragConnection(null)
  }, [])

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)))
  }, [])

  const addNode = (type: WorkflowNode["type"], position?: { x: number; y: number }) => {
    const nodeType = nodeTypes.find((t) => t.type === type)
    if (!nodeType) return

    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      title: nodeType.label,
      duration: type === "video" || type === "audio" ? 5 : undefined,
      position: position || { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
      inputs: nodeType.inputs,
      outputs: nodeType.outputs,
    }
    setNodes([...nodes, newNode])
    setShowNodeMenu(false)
    setShowPortMenu(null)
    console.log('Added node:', newNode) // Debug log
  }

  const handlePortClick = (e: React.MouseEvent, nodeId: string, port: string, type: "input" | "output") => {
    e.stopPropagation()

    if (type === "output") {
      if (!isConnecting) {
        const rect = e.currentTarget.getBoundingClientRect()
        setConnectionStart({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          nodeId,
          port,
        })
        setIsConnecting({ nodeId, port, type })
        setDragConnection({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      }
    } else if (type === "input") {
      if (isConnecting && isConnecting.type === "output") {
        handleConnectionComplete(nodeId, port)
      } else {
        setShowPortMenu({
          nodeId,
          port,
          type,
          x: e.clientX,
          y: e.clientY,
        })
      }
    }
  }

  const handleConnectionComplete = (targetNodeId: string, targetPort: string) => {
    if (isConnecting && isConnecting.type === "output") {
      const newConnection: Connection = {
        id: Date.now().toString(),
        sourceNodeId: isConnecting.nodeId,
        sourcePort: isConnecting.port,
        targetNodeId,
        targetPort,
      }
      setConnections([...connections, newConnection])
    }
    setIsConnecting(null)
    setDragConnection(null)
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId))
    setConnections(connections.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId))
    if (selectedNode === nodeId) setSelectedNode(null)
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter((c) => c.id !== connectionId))
    if (selectedConnection === connectionId) setSelectedConnection(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getConnectionPath = (connection: Connection) => {
    const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId)
    const targetNode = nodes.find((n) => n.id === connection.targetNodeId)

    if (!sourceNode || !targetNode) return ""

    // Calculate positions in node coordinate system (before zoom/pan transformation)
    const sourceX = sourceNode.position.x + 192 // Right side of source node
    const sourceY = sourceNode.position.y + 60  // Middle height of source node
    const targetX = targetNode.position.x       // Left side of target node
    const targetY = targetNode.position.y + 60  // Middle height of target node

    const distance = Math.abs(targetX - sourceX)
    const controlOffset = Math.min(distance * 0.6, 150)
    const sourceControlX = sourceX + controlOffset
    const targetControlX = targetX - controlOffset

    return `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`
  }

  const getDragConnectionPath = () => {
    if (!isConnecting || !dragConnection) return ""

    const sourceNode = nodes.find((n) => n.id === isConnecting.nodeId)
    if (!sourceNode) return ""

    // Calculate source position in node coordinate system
    const sourceX = sourceNode.position.x + 192
    const sourceY = sourceNode.position.y + 60
    
    // Convert mouse position to node coordinate system
    const targetX = (dragConnection.x - pan.x) / zoom
    const targetY = (dragConnection.y - pan.y) / zoom

    const controlOffset = Math.abs(targetX - sourceX) * 0.5
    const sourceControlX = sourceX + controlOffset
    const targetControlX = targetX - controlOffset

    return `M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY}, ${targetControlX} ${targetY}, ${targetX} ${targetY}`
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      // Don't close if clicking inside the node menu
      if (target.closest('[data-node-menu]')) {
        return
      }
      setShowNodeMenu(false)
      setShowPortMenu(null)
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedConnection) {
          deleteConnection(selectedConnection)
        } else if (selectedNode) {
          deleteNode(selectedNode)
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedConnection, selectedNode])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)))
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Workflow className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AI Workflow Studio</h1>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              Dify-Style Editor
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => handleZoom(-0.1)} className="h-8 w-8 p-0">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[50px] text-center font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="ghost" size="sm" onClick={() => handleZoom(0.1)} className="h-8 w-8 p-0">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
            >
              <Move className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col relative">
          <div className="absolute top-6 left-6 z-50">
            <div className="relative">
              <Button
                size="sm"
                className={`bg-white border text-gray-700 hover:bg-gray-50 shadow-lg transition-all duration-200 ${
                  showNodeMenu 
                    ? 'border-blue-400 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Add Node button clicked, current state:', showNodeMenu) // Debug log
                  setShowNodeMenu(!showNodeMenu)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Node
              </Button>

              {showNodeMenu && (
                <div 
                  data-node-menu
                  className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300 max-h-96 overflow-y-auto"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-lg">Node Library</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowNodeMenu(false)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {nodeTypes.map((nodeType) => (
                        <Button
                          key={nodeType.type}
                          variant="outline"
                          size="sm"
                          className="h-20 p-3 flex flex-col items-center gap-2 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 border-gray-200"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Adding node type:', nodeType.type) // Debug log
                            addNode(nodeType.type as WorkflowNode["type"])
                          }}
                        >
                          <div className={`w-8 h-8 rounded-lg ${nodeType.color} flex items-center justify-center`}>
                            <nodeType.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-center text-gray-700">{nodeType.label}</span>
                        </Button>
                      ))}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 text-gray-900">Quick Templates</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start bg-gray-50 hover:bg-blue-50 border-gray-200"
                        >
                          <Brain className="h-4 w-4 mr-3 text-blue-600" />
                          <span className="text-sm">Video Generation Pipeline</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start bg-gray-50 hover:bg-blue-50 border-gray-200"
                        >
                          <Mic className="h-4 w-4 mr-3 text-green-600" />
                          <span className="text-sm">Audio Processing Chain</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative bg-white overflow-hidden">
            <div
              ref={canvasRef}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(156,163,175,0.3) 1px, transparent 0)
                `,
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseDown={(e) => handleMouseDown(e)}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <svg 
                className="absolute inset-0 pointer-events-none z-10" 
                style={{ 
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: "0 0"
                }}
                width="100%"
                height="100%"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                  </marker>
                  <filter id="connection-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {connections.map((connection) => {
                  const isSelected = selectedConnection === connection.id
                  const isHovered = hoveredConnection === connection.id
                  
                  return (
                    <g key={connection.id}>
                      {/* Invisible wider path for easier clicking */}
                      <path
                        d={getConnectionPath(connection)}
                        stroke="transparent"
                        strokeWidth="20"
                        fill="none"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedConnection(connection.id)
                          setSelectedNode(null)
                        }}
                        onMouseEnter={() => setHoveredConnection(connection.id)}
                        onMouseLeave={() => setHoveredConnection(null)}
                      />
                      {/* Visible connection line */}
                      <path
                        d={getConnectionPath(connection)}
                        stroke={isSelected ? "#ef4444" : isHovered ? "#3b82f6" : "#9ca3af"}
                        strokeWidth={isSelected ? "4" : isHovered ? "3" : "2"}
                        fill="none"
                        markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                        className="transition-all duration-200 pointer-events-none"
                      />
                    </g>
                  )
                })}
                {isConnecting && dragConnection && (
                  <path
                    d={getDragConnectionPath()}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    fill="none"
                    markerEnd="url(#arrowhead-active)"
                    filter="url(#connection-glow)"
                    className="animate-pulse"
                  />
                )}
              </svg>

              <div
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: "0 0",
                }}
              >
                {nodes.map((node) => {
                  const nodeType = nodeTypes.find((t) => t.type === node.type)
                  const isSelected = selectedNode === node.id
                  const isDraggingThis = draggedNode === node.id

                  return (
                    <div
                      key={node.id}
                      className={`absolute w-56 rounded-xl border-2 cursor-move transition-all duration-200 shadow-lg bg-white ${
                        isSelected
                          ? "border-blue-400 shadow-xl shadow-blue-200/30 scale-105"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-xl"
                      } ${isDraggingThis ? "scale-105 shadow-2xl" : ""}`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        transform: isDraggingThis ? "scale(1.02)" : undefined,
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        handleMouseDown(e, node.id)
                      }}
                    >
                      <div
                        className={`h-12 rounded-t-xl ${nodeType?.color} px-4 flex items-center justify-between relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                        <div className="flex items-center gap-3 relative z-10">
                          {nodeType && (
                            <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                              <nodeType.icon className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-white truncate">{node.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-white hover:bg-white/20 relative z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNode(node.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="p-4 space-y-4">
                        {node.inputs.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inputs</div>
                            {node.inputs.map((input) => (
                              <div key={input} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="relative group cursor-pointer"
                                      onClick={(e) => {
                                        if (isConnecting && isConnecting.type === "output") {
                                          handleConnectionComplete(node.id, input)
                                        } else {
                                          handlePortClick(e, node.id, input, "input")
                                        }
                                      }}
                                    >
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-200"></div>
                                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 scale-150"></div>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">{input}</span>
                                      <div className="text-xs text-gray-500">Click to connect</div>
                                    </div>
                                  </div>
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {node.outputs.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outputs</div>
                            {node.outputs.map((output) => (
                              <div key={output} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                                <div className="flex items-center justify-between">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">{output}</span>
                                      <div className="text-xs text-gray-500">Click to connect</div>
                                    </div>
                                    <div
                                      className="relative group cursor-pointer"
                                      onClick={(e) => handlePortClick(e, node.id, output, "output")}
                                    >
                                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50 transition-all duration-200"></div>
                                      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200 scale-150"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {node.duration && (
                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Duration: {formatTime(node.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {isConnecting && (
              <div className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm shadow-xl animate-in slide-in-from-right-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">Drag to connect to an input port</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`border-l border-gray-200 bg-white transition-all duration-300 ${isPreviewCollapsed ? "w-12" : "w-80"}`}
        >
          <div className="h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              {!isPreviewCollapsed && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">DEBUG AND PREVIEW</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                className="h-8 w-8 p-0"
              >
                {isPreviewCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            {!isPreviewCollapsed && (
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Preview</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <Video className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Video Preview</p>
                      <Button size="sm" variant="outline" className="bg-white">
                        <Play className="h-4 w-4 mr-2" />
                        Play Preview
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Export Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Resolution</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>1080x1920 (TikTok)</option>
                        <option>1080x1080 (Square)</option>
                        <option>1920x1080 (Landscape)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">Quality</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {selectedNode && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Node Properties</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">NODE ID</div>
                          <div className="text-sm font-mono text-gray-900">{selectedNode}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">TYPE</div>
                          <div className="text-sm text-gray-900 capitalize">
                            {nodes.find((n) => n.id === selectedNode)?.type?.replace("-", " ")}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => selectedNode && deleteNode(selectedNode)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Node
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {selectedConnection && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-900">Connection Properties</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">CONNECTION ID</div>
                          <div className="text-sm font-mono text-gray-900">{selectedConnection}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">FROM</div>
                          <div className="text-sm text-gray-900">
                            {nodes.find((n) => n.id === connections.find((c) => c.id === selectedConnection)?.sourceNodeId)?.title}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-500 mb-1">TO</div>
                          <div className="text-sm text-gray-900">
                            {nodes.find((n) => n.id === connections.find((c) => c.id === selectedConnection)?.targetNodeId)?.title}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => selectedConnection && deleteConnection(selectedConnection)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Connection
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPortMenu && (
        <div
          className="fixed bg-card border border-border rounded-lg shadow-lg z-50 p-2 min-w-[200px]"
          style={{
            left: showPortMenu.x,
            top: showPortMenu.y,
          }}
        >
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Add node to connect to {showPortMenu.port}
          </div>
          <div className="space-y-1">
            {nodeTypes
              .filter((nodeType) =>
                showPortMenu.type === "input"
                  ? nodeType.outputs.some((output) => output === showPortMenu.port || showPortMenu.port === "input")
                  : nodeType.inputs.some((input) => input === showPortMenu.port || showPortMenu.port === "output"),
              )
              .map((nodeType) => (
                <Button
                  key={nodeType.type}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    const position = {
                      x: (showPortMenu.x - pan.x) / zoom - 100,
                      y: (showPortMenu.y - pan.y) / zoom - 50,
                    }
                    addNode(nodeType.type as WorkflowNode["type"], position)
                  }}
                >
                  <nodeType.icon className="h-3 w-3 mr-2" />
                  {nodeType.label}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}


