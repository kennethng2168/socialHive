"use client";

import { useState } from "react";
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
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your SocialHive AI Assistant. I can help you with content creation, analytics insights, trend analysis, and more. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('analytics') || lowerInput.includes('data')) {
      return "I can help you analyze your social media performance! Check out your Analytics dashboard for detailed insights on engagement, reach, and trending content. Would you like me to guide you to specific metrics?";
    } else if (lowerInput.includes('content') || lowerInput.includes('create')) {
      return "Great! For content creation, you can use our AI tools: Video AI Generation for creating videos, Image AI Generation for stunning visuals, or Virtual Try-On for fashion content. What type of content are you planning?";
    } else if (lowerInput.includes('trend') || lowerInput.includes('trending')) {
      return "Check the Trends section to see what's hot in your market! I can also help analyze hashtag performance and suggest content strategies based on current trends. Want to explore trending hashtags?";
    } else if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return "I'm here to help! I can assist with:\n• Content creation strategies\n• Analytics interpretation\n• Trend analysis\n• AI tool recommendations\n• Platform optimization\n\nWhat specific area interests you most?";
    } else {
      return "That's an interesting question! I'm constantly learning to better assist with social media strategy and content creation. Feel free to ask about analytics, content creation, trends, or any SocialHive features. How can I help you grow your social presence?";
    }
  };

  const quickActions = [
    { label: "Analyze Performance", icon: BarChart3, href: "/analytics" },
    { label: "Create Video", icon: Film, href: "/ai-tools?tab=video" },
    { label: "Generate Image", icon: Camera, href: "/ai-tools?tab=image" },
    { label: "Check Trends", icon: TrendingUp, href: "/trends" },
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="lg"
        >
          <div className="flex items-center justify-center relative">
            {/* SocialHive Logo */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Image
                src="/socialHive-logo.png"
                alt="SocialHive"
                width={24}
                height={24}
                className="rounded-full"
                onError={(e) => {
                  // Fallback to Bot icon if logo doesn't load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Bot className="h-5 w-5 text-purple-600 absolute inset-0 m-auto" style={{ display: 'none' }} />
            </div>
            
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            
            {/* Sparkle effect */}
            <Sparkles className="h-4 w-4 text-white absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          AI Assistant
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
                <CardTitle className="text-lg">SocialHive AI</CardTitle>
                <CardDescription className="text-purple-100 text-xs">
                  Your Smart Content Assistant
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
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about social media, analytics, or content creation..."
                  className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
