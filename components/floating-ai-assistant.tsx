"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Sparkles,
  MessageCircle,
  Loader2,
  User,
  Zap,
  BarChart3,
  Film,
  Camera,
  TrendingUp,
  Navigation,
  Lightbulb,
  Target,
  Users,
  Hash,
  Calendar,
  Briefcase,
  PenTool
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  navigationSuggestions?: NavigationSuggestion[];
  quickActions?: QuickAction[];
}

interface NavigationSuggestion {
  label: string;
  path: string;
  description: string;
  icon: any;
}

interface QuickAction {
  label: string;
  action: () => void;
  icon: any;
  variant?: 'default' | 'secondary' | 'outline';
}

export function FloatingAIAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your SocialHive Content Manager & Marketing Advisor. I'm here to help you create engaging content, analyze performance, and grow your social presence. I can also navigate you to any part of the platform!\n\n🚀 How can I help you dominate social media today?",
      sender: 'ai',
      timestamp: new Date(),
      quickActions: [
        {
          label: "Content Strategy",
          action: () => {},
          icon: Lightbulb,
          variant: 'default'
        },
        {
          label: "Analytics Review", 
          action: () => {},
          icon: BarChart3,
          variant: 'secondary'
        }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Track current page for context-aware responses
  useEffect(() => {
    const pageMap: { [key: string]: string } = {
      '/': 'Dashboard',
      '/analytics': 'Analytics',
      '/trends': 'Trends',
      '/image-gen': 'Image Generation',
      '/video-gen': 'Video Generation', 
      '/virtual-try-on': 'Virtual Try-On',
      '/sounds': 'Music & Sounds',
      '/content-workflow': 'Content Workflow',
      '/posts': 'Posts Management',
      '/comments': 'Comments',
      '/community': 'Community',
      '/inspiration': 'Inspiration Hub',
      '/upload': 'Upload Studio'
    };
    
    setCurrentPage(pageMap[pathname] || 'Unknown Page');
  }, [pathname]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call Gemini AI API
      const aiResponse = await callGeminiAI(messageToProcess, currentPage);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Response Error:', error);
      // Fallback to local response
      const fallbackResponse = generateLocalResponse(messageToProcess);
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gemini AI Integration Function
  const callGeminiAI = async (userInput: string, currentPage: string): Promise<Message> => {
    const systemPrompt = `You are SocialHive's expert Content Manager and Social Marketing Advisor AI assistant. You're integrated into a comprehensive social media management platform.

CURRENT CONTEXT:
- User is currently on: ${currentPage}
- Platform: SocialHive (social media management & content creation)
- Your role: Content strategist, marketing advisor, platform navigator

AVAILABLE PLATFORM FEATURES:
🏠 Dashboard - Overview of all activities
📊 Analytics - Performance metrics and insights
📈 Trends - Trending hashtags and content analysis
🎨 Image Generation - AI-powered image creation
🎬 Video Generation - AI video creation tools
👗 Virtual Try-On - Fashion content creation
🎵 Music & Sounds - Audio content and music generation
🔄 Content Workflow - Multi-agent content creation system
⚙️ Workflow Automation - LangGraph workflow management
📝 Posts Management - Content scheduling and management
💬 Comments - Community engagement
👥 Community - User community features
💡 Inspiration Hub - Content ideas and inspiration
📤 Upload Studio - Content upload and editing

RESPONSE GUIDELINES:
1. Act as a professional content manager and marketing strategist
2. Provide actionable, specific advice
3. Reference relevant platform features when helpful
4. Include navigation suggestions when appropriate
5. Use emojis strategically for engagement
6. Keep responses concise but valuable (2-4 sentences max)
7. Offer to navigate users to relevant sections
8. Include practical tips and strategies

SPECIALIZATIONS:
- Content strategy and planning
- Social media marketing best practices
- Platform-specific optimization
- Trend analysis and application
- Engagement growth strategies
- AI tool utilization
- Performance analysis
- Community building

User's message: "${userInput}"`;

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          systemPrompt: systemPrompt,
          currentPage: currentPage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse response for navigation suggestions
      const navigationSuggestions = extractNavigationSuggestions(data.response, userInput);
      const quickActions = generateContextualActions(userInput, currentPage);

      return {
        id: Date.now().toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        navigationSuggestions: navigationSuggestions,
        quickActions: quickActions
      };
    } catch (error) {
      throw error;
    }
  };

  // Extract navigation suggestions from AI response
  const extractNavigationSuggestions = (aiResponse: string, userInput: string): NavigationSuggestion[] => {
    const suggestions: NavigationSuggestion[] = [];
    const lowerInput = userInput.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Smart navigation mapping based on content
    if (lowerInput.includes('analytics') || lowerResponse.includes('performance') || lowerResponse.includes('metrics')) {
      suggestions.push({
        label: "View Analytics",
        path: "/analytics",
        description: "Check detailed performance metrics",
        icon: BarChart3
      });
    }

    if (lowerInput.includes('trend') || lowerResponse.includes('hashtag') || lowerResponse.includes('trending')) {
      suggestions.push({
        label: "Explore Trends",
        path: "/trends", 
        description: "Discover trending hashtags and content",
        icon: TrendingUp
      });
    }

    if (lowerInput.includes('content') || lowerInput.includes('create') || lowerResponse.includes('generate')) {
      suggestions.push({
        label: "Content Workflow",
        path: "/content-workflow",
        description: "AI-powered content creation",
        icon: Zap
      });
    }

    if (lowerInput.includes('copy') || lowerInput.includes('writing') || lowerInput.includes('caption') || lowerInput.includes('post')) {
      suggestions.push({
        label: "AI Copywriting",
        path: "/copywriting",
        description: "Generate social media copy",
        icon: PenTool
      });
    }

    if (lowerInput.includes('image') || lowerInput.includes('photo') || lowerInput.includes('picture')) {
      suggestions.push({
        label: "Generate Images",
        path: "/image-gen",
        description: "Create stunning AI images",
        icon: Camera
      });
    }

    if (lowerInput.includes('video') || lowerInput.includes('movie') || lowerInput.includes('clip')) {
      suggestions.push({
        label: "Create Videos",
        path: "/video-gen",
        description: "AI video generation tools",
        icon: Film
      });
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  // Generate contextual quick actions
  const generateContextualActions = (userInput: string, currentPage: string): QuickAction[] => {
    const actions: QuickAction[] = [];
    
    // Context-aware actions based on current page
    if (currentPage === 'Dashboard') {
      actions.push({
        label: "Content Strategy",
        action: () => router.push('/content-workflow'),
        icon: Target,
        variant: 'default'
      });
    } else if (currentPage === 'Analytics') {
      actions.push({
        label: "Improve Engagement",
        action: () => setInputMessage("How can I improve my engagement rates?"),
        icon: Users,
        variant: 'secondary'
      });
    } else if (currentPage.includes('Generation')) {
      actions.push({
        label: "Content Tips",
        action: () => setInputMessage("Give me content creation tips for " + currentPage.toLowerCase()),
        icon: Lightbulb,
        variant: 'outline'
      });
    }

    // Universal helpful actions
    actions.push({
      label: "Best Practices",
      action: () => setInputMessage("What are the current social media best practices?"),
      icon: Briefcase,
      variant: 'outline'
    });

    return actions.slice(0, 2); // Limit to 2 actions
  };

  const generateLocalResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    // Generate navigation suggestions and quick actions based on input
    const navigationSuggestions = extractNavigationSuggestions("", userInput);
    const quickActions = generateContextualActions(userInput, currentPage);
    
    let responseText = "";
    
    if (lowerInput.includes('analytics') || lowerInput.includes('data')) {
      responseText = "📊 I can help you analyze your social media performance! Your Analytics dashboard shows detailed insights on engagement, reach, and trending content. As your content manager, I recommend checking your top-performing posts and identifying patterns for future content strategy.";
    } else if (lowerInput.includes('content') || lowerInput.includes('create')) {
      responseText = "🎨 Perfect! As your marketing advisor, I suggest using our Content Workflow for end-to-end creation: AI images → videos → music → optimization. For quick content, try Image Generation or Video Generation tools. What's your content goal today?";
    } else if (lowerInput.includes('copy') || lowerInput.includes('writing') || lowerInput.includes('caption') || lowerInput.includes('post')) {
      responseText = "✍️ Great choice! Our AI Copywriting Studio can create engaging social media content for any platform. Choose your tone, audience, and platform, and I'll generate compelling copy with hashtags and engagement predictions. Ready to create viral content?";
    } else if (lowerInput.includes('trend') || lowerInput.includes('trending')) {
      responseText = "📈 Great question! Check the Trends section for real-time hashtag analysis across Asian markets. I recommend using trending hashtags within 24-48 hours of peak popularity for maximum reach. Want me to show you the hottest trends right now?";
    } else if (lowerInput.includes('strategy') || lowerInput.includes('plan')) {
      responseText = "🎯 As your content strategist, I recommend: 1) Analyze your top performers, 2) Study trending content, 3) Create content pillars, 4) Schedule consistently. Let's dive into your current performance first - shall we check Analytics?";
    } else if (lowerInput.includes('engagement') || lowerInput.includes('growth')) {
      responseText = "🚀 For engagement growth: Post when your audience is most active, use trending hashtags strategically, engage with comments within 1 hour, and create shareable content. Want me to analyze your current engagement patterns?";
    } else if (lowerInput.includes('help') || lowerInput.includes('how')) {
      responseText = "💡 I'm your dedicated Content Manager & Marketing Advisor! I can help with:\n\n📋 Content Strategy & Planning\n📊 Performance Analysis\n📈 Trend Research & Application\n🎨 Creative Direction\n🎯 Audience Growth\n⚙️ Platform Navigation\n\nWhat's your biggest social media challenge right now?";
    } else if (lowerInput.includes('navigate') || lowerInput.includes('go to') || lowerInput.includes('show me')) {
      responseText = "🧭 I can navigate you anywhere in SocialHive! Try saying 'take me to analytics' or 'show me video generation'. I know every corner of the platform and can guide you efficiently to exactly what you need.";
    } else {
      responseText = `🤔 Interesting perspective! I'm analyzing that from a content marketing angle. Currently you're on ${currentPage} - would you like me to suggest relevant actions for this section, or shall we explore other areas of SocialHive that might help with your goals?`;
    }

    return {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'ai',
      timestamp: new Date(),
      navigationSuggestions: navigationSuggestions,
      quickActions: quickActions
    };
  };

  const defaultQuickActions = [
    { 
      label: "Analytics", 
      icon: BarChart3, 
      action: () => {
        router.push("/analytics");
        setIsOpen(false);
      }
    },
    { 
      label: "Trends", 
      icon: TrendingUp, 
      action: () => {
        router.push("/trends");
        setIsOpen(false);
      }
    },
    { 
      label: "Create Content", 
      icon: Zap, 
      action: () => {
        router.push("/content-workflow");
        setIsOpen(false);
      }
    },
    { 
      label: "Help", 
      icon: MessageCircle, 
      action: () => {
        // Add a help message directly
        const helpMessage = generateLocalResponse("How can you help me?");
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "How can you help me?",
          sender: 'user',
          timestamp: new Date()
        }, helpMessage]);
      }
    },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:scale-110 active:scale-95"
          size="lg"
        >
          <div className="flex items-center justify-center relative">
            {/* AI Assistant Icon */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-purple-600" />
            </div>
            
            {/* Active indicator */}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
            
            {/* Interactive sparkles */}
            <Sparkles className="h-4 w-4 text-white absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:animate-spin" />
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -bottom-1 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100" />
          </div>
        </Button>
        
        {/* Enhanced Tooltip */}
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white px-4 py-3 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform group-hover:scale-105 shadow-xl">
          <div className="font-medium">🤖 Content Manager AI</div>
          <div className="text-xs text-gray-300 mt-1">Click to chat & navigate</div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl border-0 bg-white/95 backdrop-blur-sm transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Image
                  src="/socialHive-logo.png"
                  alt="SocialHive"
                  width={20}
                  height={20}
                  className="rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Content Manager AI</CardTitle>
                <CardDescription className="text-purple-100 text-xs">
                  Marketing Advisor • Currently on {currentPage}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-blue-100' 
                          : 'bg-gradient-to-r from-purple-100 to-pink-100'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        
                        {/* Navigation Suggestions */}
                        {message.navigationSuggestions && message.navigationSuggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-600 font-medium">🧭 Suggested Actions:</p>
                            {message.navigationSuggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-xs h-8 bg-white/80 hover:bg-blue-50"
                                onClick={() => {
                                  router.push(suggestion.path);
                                  setIsOpen(false);
                                }}
                              >
                                <suggestion.icon className="h-3 w-3 mr-2" />
                                <div className="text-left">
                                  <div className="font-medium">{suggestion.label}</div>
                                  <div className="text-gray-500 text-xs">{suggestion.description}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Quick Actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-600 font-medium">⚡ Quick Actions:</p>
                            <div className="flex gap-2 flex-wrap">
                              {message.quickActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.variant || 'outline'}
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={action.action}
                                >
                                  <action.icon className="h-3 w-3 mr-1" />
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                          <span className="text-sm text-gray-600">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Invisible element for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {defaultQuickActions.map((action) => (
                  <Button
                    key={action.label}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                    onClick={action.action}
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about social media, analytics, or content creation..."
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                  <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
