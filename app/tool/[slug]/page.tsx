"use client";

import { AppLayout } from "@/components/app-layout";
import { Sidebar } from "@/components/sidebar";

export default function ToolPage({ params }: { params: { slug: string } }) {
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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tool Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The requested tool doesn't exist.
            </p>
            <a href="/" className="text-primary hover:text-primary/80 font-medium">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Main Content Area */}
      <main className="flex flex-col items-center justify-center py-20 px-8 bg-white min-h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto w-full text-center">
            {/* Tool Icon and Title */}
            <div className="flex items-center justify-center mb-6">
              <img
                src={currentTool.icon}
                alt={currentTool.iconAlt}
                className="h-20 mr-5"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {currentTool.title}
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
              {currentTool.description}
            </p>

            {/* Input Field */}
            <div className="w-full mb-8">
              <div className="flex items-center bg-white border-2 border-gray-900 rounded-full p-2 hover:shadow-lg transition-all">
                {/* Plus Icon */}
                <div className="flex-shrink-0 ml-2">
                  <button type="button" className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Add attachment</title>
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
                  className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 px-4 py-2"
                />

                {/* Submit Button */}
                <button type="button" className="flex-shrink-0 ml-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Submit</title>
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
            <div className="flex justify-center mt-8">
              <a
                href="/"
                className="text-primary hover:text-primary/80 font-medium text-base flex items-center gap-2 transition-colors group"
              >
                <span>Back to home</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:-translate-x-1 transition-transform"
                >
                  <title>Arrow</title>
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </a>
            </div>
          </div>
        </main>
    </AppLayout>
  );
}
