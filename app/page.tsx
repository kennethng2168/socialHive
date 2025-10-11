"use client";

import { AppLayout } from "@/components/app-layout";

export default function Home() {
  return (
    <AppLayout>
      {/* Main Content Area - All-in-One Tool */}
      <main className="flex flex-col items-center justify-center py-20 px-8 bg-white min-h-[calc(100vh-73px)]">
          <div className="max-w-4xl mx-auto w-full text-center">
            {/* Tool Icon and Title */}
            <div className="flex items-center justify-center mb-6">
              <img
                src="/mainPage_assets/bee.png"
                alt="All-in-One Content Creator"
                className="h-20 mr-5"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                All-in-One Content Creator
              </h1>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-12 max-w-2xl mx-auto text-xl leading-relaxed">
              Create complete AI-driven content workflows — from image generation to video production, lip-syncing, and music creation
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
                href="/tools"
                className="text-primary hover:text-primary/80 font-medium text-base flex items-center gap-2 transition-colors group"
              >
                <span>Discover more AI tools</span>
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
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <title>Arrow</title>
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="mt-20 w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image-to-Video Animator */}
              <a href="/tool/image-to-video" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="mb-4">
                    <img
                      src="/mainPage_assets/dragon.png"
                      alt="Image-to-Video Animator"
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    Image-to-Video Animator
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Prompt whatever you desire and watch it come to life with smooth AI-powered animation.
                  </p>
                </div>
              </a>

              {/* AI Image Generation Studio */}
              <a href="/image-gen" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="mb-4">
                    <img
                      src="/mainPage_assets/cookie.png"
                      alt="AI Image Generation Studio"
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    AI Image Generation Studio
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Turn your ideas into stunning visuals. Generate high-quality, photorealistic images with advanced AI models.
                  </p>
                </div>
              </a>

              {/* AI Video Generation Studio */}
              <a href="/video-gen" className="group">
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer h-full">
                  <div className="mb-4">
                    <img
                      src="/mainPage_assets/starfish.png"
                      alt="AI Video Generation Studio"
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    AI Video Generation Studio
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Create dynamic short videos in minutes using state-of-the-art AI models. Perfect for reels, ads, and social content.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </main>
    </AppLayout>
  );
}
