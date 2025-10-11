"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Home,
  Video,
  BarChart3,
  MessageCircle,
  TrendingUp,
  Wand2,
  Music,
  MessageSquare,
  Plus,
  Bot,
  ImageIcon,
  Shirt,
  Camera,
  Film,
  Zap,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", icon: Home, href: "/", current: true },
  { name: "Posts", icon: Video, href: "/posts", current: false },
  { name: "Analytics", icon: BarChart3, href: "/analytics", current: false },
  { name: "Trends", icon: TrendingUp, href: "/trends", current: false },
  { name: "Comments", icon: MessageCircle, href: "/comments", current: false },
];

const aiTools = [
  {
    name: "Content Workflow Studio",
    icon: Zap,
    href: "/content-workflow",
    current: false,
  },
  {
    name: "AI Content Assistant",
    icon: Bot,
    href: "/ai-assistant",
    current: false,
  },
  {
    name: "AI Copywriting Studio",
    icon: PenTool,
    href: "/copywriting",
    current: false,
  },
  {
    name: "Image Generation Studio",
    icon: Camera,
    href: "/image-gen",
    current: false,
  },
  {
    name: "Video Generation Studio",
    icon: Film,
    href: "/video-gen",
    current: false,
  },
  {
    name: "Virtual Try-On",
    icon: Shirt,
    href: "/virtual-try-on",
    current: false,
  },
  // {
  //   name: "AI Inspiration",
  //   icon: Sparkles,
  //   href: "/ai-inspiration",
  //   current: false,
  // },
  // { name: "Unlimited Sounds", icon: Music, href: "/sounds", current: false },
];

const others = [
  { name: "Feedback", icon: MessageSquare, href: "/feedback", current: false },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleItemClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.focus();
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-white border-r border-gray-200 z-40 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <img src="/socialHive-logo.png" alt="SocialHive Logo" className="h-8" />
      </div>

      {/* Upload Button */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/upload">
          <Button className="w-full bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Generate Content
          </Button>
        </Link>
      </div>

      {/* Navigation with ScrollArea */}
      <ScrollArea className="flex-1">
        <nav className="px-3 py-4">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
              Manage
            </p>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus:outline-none",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="space-y-0.5 pt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
              AI Tools
            </p>
            {aiTools.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus:outline-none",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-gray-700 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1 truncate">{item.name}</span>
                {(item.name.includes("AI") ||
                  item.name === "Content Workflow Studio") && (
                  <Wand2 className="h-3.5 w-3.5 flex-shrink-0" />
                )}
              </Link>
            ))}
          </div>

          <div className="space-y-0.5 pt-6 pb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
              Support
            </p>
            {others.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus:outline-none",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}
