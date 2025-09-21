"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users, Sparkles } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface CleanAnimatedWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface AnimatedWordPosition {
  word: WordCloudData;
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  delay: number;
  isVisible: boolean;
}

export function CleanAnimatedWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: CleanAnimatedWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [wordPositions, setWordPositions] = useState<AnimatedWordPosition[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const WORDS_PER_PAGE = 80;
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 800;

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

  // Calculate elegant font sizes
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
    
    // Elegant size progression
    if (normalizedValue > 0.8) return 42;
    if (normalizedValue > 0.6) return 36;
    if (normalizedValue > 0.4) return 30;
    if (normalizedValue > 0.3) return 26;
    if (normalizedValue > 0.2) return 22;
    if (normalizedValue > 0.1) return 18;
    if (normalizedValue > 0.05) return 16;
    return 14;
  };

  // Elegant spiral positioning algorithm
  const calculatePositions = (wordsToPosition: WordCloudData[]) => {
    const positions: AnimatedWordPosition[] = [];
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const padding = 12;
    
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
      const estimatedWidth = word.text.length * fontSize * 0.6;
      
      let x, y;
      let placed = false;
      let attempts = 0;
      
      // Start from center and spiral outward
      while (!placed && attempts < 200) {
        if (attempts === 0 && index === 0) {
          // First word in center
          x = centerX;
          y = centerY;
        } else {
          // Spiral positioning
          const angle = attempts * 0.5;
          const radius = Math.sqrt(attempts) * 8;
          
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }
        
        // Check bounds
        if (x - estimatedWidth/2 >= padding && 
            x + estimatedWidth/2 <= CANVAS_WIDTH - padding &&
            y - fontSize/2 >= padding && 
            y + fontSize/2 <= CANVAS_HEIGHT - padding) {
          
          // Check collision
          const collision = positions.some(pos => {
            const dx = Math.abs(x - pos.x);
            const dy = Math.abs(y - pos.y);
            const minDistanceX = (estimatedWidth + pos.word.text.length * pos.fontSize * 0.6) / 2 + padding;
            const minDistanceY = (fontSize + pos.fontSize) / 2 + padding;
            
            return dx < minDistanceX && dy < minDistanceY;
          });
          
          if (!collision) {
            placed = true;
          }
        }
        
        attempts++;
      }
      
      // Fallback to grid if spiral fails
      if (!placed) {
        const cols = Math.ceil(Math.sqrt(wordsToPosition.length));
        const row = Math.floor(index / cols);
        const col = index % cols;
        x = (col + 1) * (CANVAS_WIDTH / (cols + 1));
        y = (row + 1) * (CANVAS_HEIGHT / (Math.ceil(wordsToPosition.length / cols) + 1));
      }
      
      positions.push({
        word,
        x,
        y,
        fontSize,
        opacity: 0,
        delay: index * 50, // Staggered animation
        isVisible: false
      });
    });
    
    return positions;
  };

  // Handle data changes and positioning
  useEffect(() => {
    const processedWords = getProcessedWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, processedWords.length);
    const currentWords = processedWords.slice(startIndex, endIndex);
    
    const positions = calculatePositions(currentWords);
    setWordPositions(positions);
    
    // Elegant entrance animation
    positions.forEach((position, index) => {
      setTimeout(() => {
        setWordPositions(prev => 
          prev.map((pos, i) => 
            i === index ? { ...pos, opacity: 1, isVisible: true } : pos
          )
        );
      }, position.delay);
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
      {/* Clean Header with Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-600" />
            {title}
          </h2>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Hash className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-blue-900">{totalHashtags}</div>
              <div className="text-xs text-blue-700">Total Hashtags</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <BarChart3 className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-green-900">{uniqueHashtags}</div>
              <div className="text-xs text-green-700">Unique Hashtags</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Eye className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-purple-900">{(pageViews / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-purple-700">Page Views</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-5 w-5 text-orange-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-orange-900">{(pagePosts / 1000).toFixed(1)}K</div>
              <div className="text-xs text-orange-700">Page Posts</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Filter className="h-5 w-5 text-gray-600 mx-auto mb-2" />
              <div className="font-bold text-xl text-gray-900">{processedWords.length}</div>
              <div className="text-xs text-gray-700">Filtered Results</div>
            </div>
          </div>
        </div>

        {/* Clean Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hashtags or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
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
              >
                →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Clean Animated WordCloud */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border shadow-sm overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }} />
          </div>

          {/* Animated Hashtag Words */}
          {wordPositions.map((position, index) => {
            const word = position.word;
            return (
              <div
                key={`${word.text}-${word.country}-${index}`}
                className="absolute cursor-pointer select-none transition-all duration-300 hover:z-20"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  opacity: position.opacity,
                  transform: `translate(-50%, -50%) ${hoveredWord === word ? 'scale(1.1)' : 'scale(1)'}`,
                  animation: position.isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                  animationDelay: `${position.delay}ms`,
                }}
                onClick={() => {
                  setHoveredWord(word);
                  onShowAnalytics?.(word);
                }}
                onMouseEnter={() => setHoveredWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <div
                  className="px-3 py-1.5 rounded-lg text-white font-semibold shadow-sm transition-all duration-300 hover:shadow-lg relative overflow-hidden"
                  style={{
                    backgroundColor: COUNTRY_COLORS[word.country || ''] || '#6b7280',
                    fontSize: `${position.fontSize}px`,
                    fontWeight: word.rank && word.rank <= 10 ? 'bold' : 'semibold',
                    boxShadow: hoveredWord === word ? 
                      `0 8px 25px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}40` : 
                      `0 2px 8px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}20`,
                  }}
                >
                  {/* Subtle shine effect on hover */}
                  {hoveredWord === word && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{
                        animation: 'shine 1s ease-in-out',
                        transform: 'translateX(-100%)',
                      }}
                    />
                  )}
                  
                  <span className="relative z-10">#{word.text}</span>
                </div>
                
                {/* Elegant rank indicator */}
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

                {/* Subtle trend indicator */}
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

        {/* Clean Information Panel */}
        {hoveredWord && (
          <Card className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm shadow-lg border transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-gray-600" />
                    <span className="font-bold text-xl text-gray-900">#{hoveredWord.text}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Rank #{hoveredWord.rank}</Badge>
                    
                    {hoveredWord.country && (
                      <Badge variant="outline" style={{ 
                        borderColor: COUNTRY_COLORS[hoveredWord.country],
                        color: COUNTRY_COLORS[hoveredWord.country]
                      }}>
                        {COUNTRY_NAMES[hoveredWord.country]}
                      </Badge>
                    )}
                    
                    {hoveredWord.video_views && (
                      <Badge variant="outline" className="text-blue-600">
                        {(hoveredWord.video_views / 1000000).toFixed(2)}M views
                      </Badge>
                    )}
                    
                    {hoveredWord.publish_cnt && (
                      <Badge variant="outline" className="text-green-600">
                        {(hoveredWord.publish_cnt / 1000).toFixed(1)}K posts
                      </Badge>
                    )}
                    
                    {hoveredWord.trend && (
                      <Badge 
                        variant={hoveredWord.trend === 'up' ? 'default' : hoveredWord.trend === 'down' ? 'destructive' : 'secondary'}
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
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
