"use client";

import { useState, useRef, useEffect } from "react";
import { BarChart3, TrendingUp, Settings } from "lucide-react";

export default function ToolPage({ params }: { params: { slug: string } }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Define the tool configurations
  const tools = {
    "image-to-video": {
      title: "Image-to-Video Animator",
      description:
        "Prompt whatever you desire and watch it come to life with smooth AI-powered animation",
      icon: "/mainPage_assets/dragon.png",
      iconAlt: "Dragon Icon",
    },
    "ai-music-video": {
      title: "AI Music Video Studio",
      description:
        "Combine AI-generated soundtracks, visuals, and motion into a polished music video — all in one place",
      icon: "/mainPage_assets/star.png",
      iconAlt: "Star Icon",
    },
    "all-in-one": {
      title: "All-in-One Content Creator",
      description:
        "Create complete AI-driven content workflows — from image generation to video production, lip-syncing, and music creation",
      icon: "/mainPage_assets/bee.png",
      iconAlt: "Bee Icon",
    },
  };

  // Get the current tool configuration
  const currentTool = tools[params.slug as keyof typeof tools];

  // If tool doesn't exist, show 404 or redirect
  if (!currentTool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tool Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The requested tool doesn't exist.
          </p>
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      {/* Navigation Bar */}

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="block">
              <div className="flex items-center">
                <img
                  src="/socialHive-logo.png"
                  alt="SocialHive Logo"
                  className="h-8"
                />
              </div>
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Amber Chen</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-600 rounded-full" />
              </div>
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <a
                      href="/analytics"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-3 text-gray-500" />
                      Analytics
                    </a>
                    <a
                      href="/trends"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 mr-3 text-gray-500" />
                      Trends
                    </a>
                    <a
                      href="/tools"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      All Tools
                    </a>
                    <a
                      href="/comments"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comments
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        alert("Logout functionality would be implemented here");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="h-4 w-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-30">
        <main className="flex flex-col items-center justify-center py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tool Icon and Title */}
            <div className="flex items-center justify-center mb-6">
              <img
                src={currentTool.icon}
                alt={currentTool.iconAlt}
                className="h-15 mr-5 mb-2"
              />
              <h1 className="text-3xl md:text-4xl text-gray-900">
                {currentTool.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-12 max-w-xl mx-auto light-text text-xl">
              {currentTool.description}
            </p>
          </div>

          {/* Input Field - Full Width */}
          <div className="w-full sm:px-12 lg:px-16 mb-5 ">
            <div className="flex items-center bg-white border-2 border-black rounded-full p-2  transition-colors">
              {/* Plus Icon */}
              <div className="flex-shrink-0 mr-4">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button className="w-8 h-8 flex items-center justify-center  transition-colors">
                  {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                  <svg
                    className="w-10 h-10 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              </div>

              {/* Input */}
              <input
                type="text"
                placeholder="Type your idea or upload a photo — generate visuals, videos, and captions instantly."
                className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 light-text"
              />

              {/* Submit Button */}
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button className="flex-shrink-0 ml-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Link */}
          <div className="flex justify-center">
            <a
              href="/"
              className="text-blue-500 hover:text-blue-500 font-medium text-md flex items-center space-x-2 transition-colors underline"
            >
              <span>Keep creating — discover more AI tools</span>
              {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M13 5H19V11" />
                <path d="M19 5L5 19" />
              </svg>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
