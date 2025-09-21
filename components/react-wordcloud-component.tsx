"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users, Sparkles, Cloud } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";
import ReactWordcloud from 'react-wordcloud';

// Import required CSS
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

interface ReactWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface WordCloudWord {
  text: string;
  value: number;
  originalData: WordCloudData;
}

export default function ReactWordCloudComponent({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: ReactWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  // Remove hoveredWord state to prevent re-rendering on hover
  const [currentPage, setCurrentPage] = useState(0);

  const WORDS_PER_PAGE = 100;

  // Filter and sort words
  const getProcessedWords = () => {
    let filtered = words;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(word => 
        word.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        COUNTRY_NAMES[word.country || '']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCountry !== "all") {
      filtered = filtered.filter(word => word.country === selectedCountry);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":
          return (b.video_views || 0) - (a.video_views || 0);
        case "posts":
          return (b.publish_cnt || 0) - (a.publish_cnt || 0);
        case "rank":
        default:
          return (a.rank || 999) - (b.rank || 999);
      }
    });
    
    return filtered;
  };

  // Calculate value for WordCloud
  const calculateWordValue = (word: WordCloudData) => {
    switch (sortBy) {
      case "views":
        return Math.max(1, Math.log10((word.video_views || 1) + 1) * 10);
      case "posts":
        return Math.max(1, Math.log10((word.publish_cnt || 1) + 1) * 15);
      case "rank":
      default:
        return Math.max(5, 100 - Math.min(100, word.rank || 100));
    }
  };

  // Prepare data for react-wordcloud
  const prepareWordCloudData = (): WordCloudWord[] => {
    const processedWords = getProcessedWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, processedWords.length);
    const currentWords = processedWords.slice(startIndex, endIndex);
    
    return currentWords.map(word => ({
      text: word.text,
      value: calculateWordValue(word),
      originalData: word
    }));
  };

  // WordCloud callbacks - Memoized to prevent re-renders
  const callbacks = {
    getWordColor: (word: WordCloudWord) => {
      return COUNTRY_COLORS[word.originalData.country || ''] || '#6b7280';
    },
    onWordClick: (word: WordCloudWord) => {
      // Only set hovered word on click for analytics, don't cause re-render
      if (onShowAnalytics) {
        onShowAnalytics(word.originalData);
      }
    },
    // Remove onWordMouseOver to prevent re-rendering
    // onWordMouseOver: undefined,
    // onWordMouseOut: undefined,
    getWordTooltip: (word: WordCloudWord) => {
      const data = word.originalData;
      return `
        <div style="padding: 12px; background: white; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; max-width: 280px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
            #${data.text}
          </div>
          <div style="margin-bottom: 4px; color: #6b7280; display: flex; align-items: center; gap: 6px;">
            <span style="color: ${COUNTRY_COLORS[data.country || '']}; font-size: 12px;">●</span>
            <span style="font-weight: 500;">${COUNTRY_NAMES[data.country || ''] || 'Unknown'}</span>
          </div>
          <div style="margin-bottom: 4px; color: #6b7280; font-size: 14px;">
            <span style="font-weight: 600; color: #3b82f6;">Rank:</span> #${data.rank || 'N/A'}
          </div>
          ${data.video_views ? `<div style="margin-bottom: 4px; color: #8b5cf6; font-size: 14px;">
            <span style="font-weight: 600;">Views:</span> ${(data.video_views / 1000000).toFixed(2)}M
          </div>` : ''}
          ${data.publish_cnt ? `<div style="margin-bottom: 4px; color: #10b981; font-size: 14px;">
            <span style="font-weight: 600;">Posts:</span> ${(data.publish_cnt / 1000).toFixed(1)}K
          </div>` : ''}
          ${data.trend ? `<div style="color: ${data.trend === 'up' ? '#10b981' : data.trend === 'down' ? '#ef4444' : '#6b7280'}; font-size: 14px; font-weight: 600;">
            ${data.trend === 'up' ? '📈 Trending Up' : data.trend === 'down' ? '📉 Declining' : '➡️ Stable'}
          </div>` : ''}
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
            Click for detailed analytics
          </div>
        </div>
      `;
    }
  };

  // WordCloud options - Stable configuration to prevent re-renders
  const options = {
    rotations: 2,
    rotationAngles: [-15, 15],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 'bold' as const,
    padding: 4,
    deterministic: true, // Make layout deterministic to prevent re-renders
    transitionDuration: 800,
    enableTooltip: true,
    tooltipOptions: {
      allowHTML: true,
      animation: 'scale' as const,
      theme: 'light' as const,
      placement: 'auto' as const,
      arrow: true,
      duration: [300, 0],
      maxWidth: 320,
      interactive: false, // Prevent tooltip from interfering with wordcloud
    }
  };

  // WordCloud size - Centered and responsive
  const size: [number, number] = [1200, 700];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCountry, sortBy]);

  const processedWords = getProcessedWords();
  const totalPages = Math.ceil(processedWords.length / WORDS_PER_PAGE);
  const wordCloudData = prepareWordCloudData();
  
  const availableCountries = Array.from(new Set(words.map(w => w.country).filter(Boolean)))
    .map(code => ({ code, name: COUNTRY_NAMES[code!] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate statistics for current view
  const currentPageWords = processedWords.slice(currentPage * WORDS_PER_PAGE, (currentPage + 1) * WORDS_PER_PAGE);
  const pageViews = currentPageWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
  const pagePosts = currentPageWords.reduce((sum, w) => sum + (w.publish_cnt || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Cloud className="h-6 w-6 text-purple-600" />
            {title} - React WordCloud
          </h2>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <Hash className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-blue-900">{totalHashtags}</div>
              <div className="text-xs text-blue-700">Total Hashtags</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <BarChart3 className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-green-900">{uniqueHashtags}</div>
              <div className="text-xs text-green-700">Unique Hashtags</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <Eye className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-purple-900">{(pageViews / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-purple-700">Page Views</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <Users className="h-5 w-5 text-orange-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-orange-900">{(pagePosts / 1000).toFixed(1)}K</div>
              <div className="text-xs text-orange-700">Page Posts</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <Filter className="h-5 w-5 text-gray-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-gray-900">{processedWords.length}</div>
              <div className="text-xs text-gray-700">Filtered Results</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hashtags or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 backdrop-blur-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white/90 backdrop-blur-sm"
            >
              <option value="all">All Countries</option>
              {availableCountries.map(country => {
                const count = words.filter(w => w.country === country.code).length;
                return (
                  <option key={country.code} value={country.code}>
                    {country.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rank" | "views" | "posts")}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white/90 backdrop-blur-sm"
          >
            <option value="rank">Sort by Rank</option>
            <option value="views">Sort by Views</option>
            <option value="posts">Sort by Posts</option>
          </select>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="bg-white/90 backdrop-blur-sm"
              >
                ←
              </Button>
              <span className="text-sm font-medium px-2">
                {currentPage + 1}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="bg-white/90 backdrop-blur-sm"
              >
                →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* React WordCloud Canvas */}
      <div className="relative">
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-xl border shadow-sm p-8">
          {wordCloudData.length > 0 ? (
            <div className="flex items-center justify-center w-full">
              <div className="w-full max-w-6xl mx-auto" style={{ height: '700px' }}>
                <ReactWordcloud
                  words={wordCloudData}
                  callbacks={callbacks}
                  options={options}
                  size={size}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hashtags found with current filters</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter settings</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Panel */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-purple-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold text-gray-900">Interactive WordCloud</span>
                </div>
                <p className="text-sm text-gray-600">
                  Hover over hashtags for detailed information • Click for analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Country Performance Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {availableCountries.map(country => {
          const countryWords = processedWords.filter(w => w.country === country.code);
          const countryViews = countryWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
          const countryPosts = countryWords.reduce((sum, w) => sum + (w.publish_cnt || 0), 0);
          const topHashtag = countryWords.find(w => w.rank === Math.min(...countryWords.map(cw => cw.rank || 999)));
          
          return (
            <Card key={country.code} className="text-center hover:shadow-md transition-all duration-200">
              <CardContent className="p-3">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COUNTRY_COLORS[country.code!] }}
                />
                <div className="font-semibold text-sm mb-2">{country.name}</div>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-600">{countryWords.length} hashtags</div>
                  <div className="text-blue-600">{(countryViews / 1000000).toFixed(1)}M views</div>
                  <div className="text-green-600">{(countryPosts / 1000).toFixed(1)}K posts</div>
                  {topHashtag && (
                    <div className="text-purple-600 font-medium">
                      Top: #{topHashtag.text}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
