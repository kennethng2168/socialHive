"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center flex-1 max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tools, content, or analytics..."
                  className="pl-10 w-full border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
              </Button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="Amber Chen" />
                  <AvatarFallback className="bg-primary text-white font-semibold">AC</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">Amber Chen</span>
                  <span className="text-xs text-gray-500">Creator</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}


