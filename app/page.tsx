"use client";

import { AppLayout } from "@/components/app-layout";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Image as ImageIcon, Video, FileText, Upload } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('target_language', 'en');
      
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      const response = await fetch('/api/smart-creative', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Generation failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

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
            Create complete AI-driven content — images, videos, and copywriting with a single prompt
          </p>

          {/* Input Field */}
          <div className="w-full mb-8">
            <div className="flex items-center bg-white border-2 border-gray-900 rounded-full p-2 hover:shadow-lg transition-all">
              {/* Upload Button */}
              <div className="flex-shrink-0 ml-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-100 rounded-full"
                  title="Upload image (optional)"
                >
                  {uploadedFile ? (
                    <ImageIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Input */}
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your idea — generate visuals, videos, and captions instantly."
                className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 px-4 py-2"
                disabled={isGenerating}
              />

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-shrink-0 ml-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {/* File upload indicator */}
            {uploadedFile && (
              <div className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>{uploadedFile.name}</span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-8 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-gray-600">AI is working its magic...</p>
                  <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Display */}
          {result && result.success && (
            <div className="mb-8 space-y-6">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ✨ Generated Content
                </h2>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  Intent: {result.intent?.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Images */}
                {result.assets?.image && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Generated Image</h3>
                      </div>
                      <img
                        src={result.assets.image.url}
                        alt="Generated"
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => window.open(result.assets.image.url, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          View Full Size
                        </Button>
                        <Button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = result.assets.image.url;
                            a.download = 'generated-image.png';
                            a.click();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Videos */}
                {result.assets?.video && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Video className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Generated Video</h3>
                      </div>
                      <video
                        src={result.assets.video.url}
                        controls
                        className="w-full rounded-lg shadow-lg"
                      />
                      <div className="mt-4">
                        <Button
                          onClick={() => window.open(result.assets.video.url, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          Download Video
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Copywriting */}
                {result.assets?.copywriting && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Generated Copy</h3>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {result.assets.copywriting}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(result.assets.copywriting);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Copy to Clipboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

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
