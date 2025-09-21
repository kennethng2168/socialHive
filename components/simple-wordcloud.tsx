"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users, Sparkles, Cloud } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface SimpleWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface PositionedWord {
  word: WordCloudData;
  x: number;
  y: number;
  fontSize: number;
  rotation: number;
  opacity: number;
}

export default function SimpleWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: SimpleWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const WORDS_PER_PAGE = 60;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

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

  // Calculate font size based on importance
  const calculateFontSize = (word: WordCloudData, index: number, maxValue: number) => {
    let value;
    switch (sortBy) {
      case "views":
        value = word.video_views || 0;
        break;
      case "posts":
        value = word.publish_cnt || 0;
        break;
      case "rank":
      default:
        value = Math.max(0, 200 - (word.rank || 999));
        break;
    }
    
    const normalizedValue = maxValue > 0 ? value / maxValue : 0;
    
    // Font size progression
    if (normalizedValue > 0.8) return 48;
    if (normalizedValue > 0.6) return 40;
    if (normalizedValue > 0.4) return 32;
    if (normalizedValue > 0.3) return 28;
    if (normalizedValue > 0.2) return 24;
    if (normalizedValue > 0.1) return 20;
    if (normalizedValue > 0.05) return 18;
    return 16;
  };

  // Spiral-based positioning for wordcloud effect
  const calculatePositions = (wordsToPosition: WordCloudData[]) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const positions: PositionedWord[] = [];
    
    // Get max value for sizing
    const maxValue = Math.max(...wordsToPosition.map(word => {
      switch (sortBy) {
        case "views":
          return word.video_views || 0;
        case "posts":
          return word.publish_cnt || 0;
        case "rank":
        default:
          return 200 - (word.rank || 999);
      }
    }));

    wordsToPosition.forEach((word, index) => {
      const fontSize = calculateFontSize(word, index, maxValue);
      
      // Spiral positioning
      const angle = index * 0.5;
      const radius = Math.sqrt(index) * 15;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Random rotation for variety
      const rotation = (Math.random() - 0.5) * 60; // -30 to +30 degrees
      
      positions.push({
        word,
        x: Math.max(fontSize/2, Math.min(CANVAS_WIDTH - fontSize/2, x)),
        y: Math.max(fontSize/2, Math.min(CANVAS_HEIGHT - fontSize/2, y)),
        fontSize,
        rotation,
        opacity: 0
      });
    });
    
    return positions;
  };

  // Position words when data changes
  useEffect(() => {
    const processedWords = getProcessedWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, processedWords.length);
    const currentWords = processedWords.slice(startIndex, endIndex);
    
    const positions = calculatePositions(currentWords);
    setPositionedWords(positions);
    
    // Animate in words
    positions.forEach((position, index) => {
      setTimeout(() => {
        setPositionedWords(prev => 
          prev.map((pos, i) => 
            i === index ? { ...pos, opacity: 1 } : pos
          )
        );
      }, index * 50);
    });
  }, [words, currentPage, searchTerm, selectedCountry, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCountry, sortBy]);

  const processedWords = getProcessedWords();
  const totalPages = Math.ceil(processedWords.length / WORDS_PER_PAGE);
  
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
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Cloud className="h-6 w-6 text-indigo-600" />
            {title} - Interactive WordCloud
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

      {/* Simple WordCloud Canvas */}
      <div className="relative">
        <div
          ref={containerRef}
          className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl border shadow-sm relative overflow-hidden"
          style={{ 
            width: CANVAS_WIDTH, 
            height: CANVAS_HEIGHT,
            margin: '0 auto'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Positioned Words */}
          {positionedWords.map((positioned, index) => {
            const word = positioned.word;
            return (
              <div
                key={`${word.text}-${word.country}-${index}`}
                className="absolute cursor-pointer select-none transition-all duration-300 hover:z-20"
                style={{
                  left: `${positioned.x}px`,
                  top: `${positioned.y}px`,
                  opacity: positioned.opacity,
                  transform: `translate(-50%, -50%) rotate(${positioned.rotation}deg) ${hoveredWord === word ? 'scale(1.1)' : 'scale(1)'}`,
                  animation: positioned.opacity > 0 ? 'fadeIn 0.6s ease-out' : 'none',
                }}
                onClick={() => {
                  setHoveredWord(word);
                  onShowAnalytics?.(word);
                }}
                onMouseEnter={() => setHoveredWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <div
                  className="px-3 py-1 rounded-lg text-white font-bold shadow-sm transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: COUNTRY_COLORS[word.country || ''] || '#6b7280',
                    fontSize: `${positioned.fontSize}px`,
                    boxShadow: hoveredWord === word ? 
                      `0 8px 25px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}40` : 
                      `0 2px 8px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}20`,
                  }}
                >
                  #{word.text}
                </div>
                
                {/* Rank indicator */}
                {word.rank && word.rank <= 15 && (
                  <div 
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-white transition-all duration-300"
                    style={{ 
                      fontSize: '9px',
                      transform: hoveredWord === word ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    {word.rank}
                  </div>
                )}

                {/* Trend indicator */}
                {word.trend === 'up' && (
                  <div className="absolute -top-1 -left-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-2 w-2 text-white" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Information Panel */}
        {hoveredWord && (
          <Card className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-indigo-200 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COUNTRY_COLORS[hoveredWord.country || ''] || '#6b7280' }}
                    />
                    <Hash className="h-5 w-5 text-gray-600" />
                    <span className="font-bold text-xl text-gray-900">#{hoveredWord.text}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100">
                      Rank #{hoveredWord.rank}
                    </Badge>
                    
                    {hoveredWord.country && (
                      <Badge variant="outline" style={{ 
                        borderColor: COUNTRY_COLORS[hoveredWord.country],
                        color: COUNTRY_COLORS[hoveredWord.country],
                        background: `${COUNTRY_COLORS[hoveredWord.country]}10`
                      }}>
                        {COUNTRY_NAMES[hoveredWord.country]}
                      </Badge>
                    )}
                    
                    {hoveredWord.video_views && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                        {(hoveredWord.video_views / 1000000).toFixed(2)}M views
                      </Badge>
                    )}
                    
                    {hoveredWord.publish_cnt && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        {(hoveredWord.publish_cnt / 1000).toFixed(1)}K posts
                      </Badge>
                    )}
                    
                    {hoveredWord.trend && (
                      <Badge 
                        variant={hoveredWord.trend === 'up' ? 'default' : hoveredWord.trend === 'down' ? 'destructive' : 'secondary'}
                        className={hoveredWord.trend === 'up' ? 'bg-green-500' : ''}
                      >
                        {hoveredWord.trend === 'up' ? '↗ Trending' : 
                         hoveredWord.trend === 'down' ? '↘ Declining' : '→ Stable'}
                      </Badge>
                    )}
                  </div>
                </div>

                {onShowAnalytics && (
                  <Button
                    onClick={() => onShowAnalytics(hoveredWord)}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
