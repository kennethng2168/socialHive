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
  Sparkles,
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
    <div className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-white border-r border-gray-200 z-40">
      {/* Header */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-100">
        <img src="/socialHive-logo.png" alt="SocialHive Logo" />
      </div>

      {/* Upload Button */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/upload">
          <Button className="w-full bg-foreground hover:bg-primary/90 text-white rounded-lg font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </Link>
      </div>

      {/* Navigation with ScrollArea */}
      <ScrollArea className="flex-1">
        <nav className="px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
              Manage
            </p>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive(item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
              AI Tools
            </p>
            {aiTools.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-gray-600 hover:bg-accent/10 hover:text-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {(item.name.includes("AI") ||
                  item.name === "Content Workflow Studio") && (
                  <Wand2 className="h-3 w-3 text-accent ml-auto" />
                )}
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
              Others
            </p>
            {others.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive(item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
}
