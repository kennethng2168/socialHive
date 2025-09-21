"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface CompleteWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface WordPosition {
  word: WordCloudData;
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
}

export function CompleteWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: CompleteWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 800;

  // Filter and sort words
  const getProcessedWords = () => {
    let filtered = words;
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(word => 
        word.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        COUNTRY_NAMES[word.country || '']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by country
    if (selectedCountry !== "all") {
      filtered = filtered.filter(word => word.country === selectedCountry);
    }
    
    // Sort by selected criteria
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

  // Calculate font size based on sorting criteria
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
        value = maxValue - (word.rank || 999); // Invert rank for size calculation
        break;
    }
    
    const normalizedValue = maxValue > 0 ? value / maxValue : 0;
    
    // Size range: 12px to 48px
    const minSize = 12;
    const maxSize = 48;
    const size = minSize + (maxSize - minSize) * Math.sqrt(normalizedValue);
    
    return Math.max(minSize, Math.min(maxSize, size));
  };

  // Advanced positioning algorithm to fit ALL words
  const calculateAllPositions = (wordsToPosition: WordCloudData[]) => {
    const positions: WordPosition[] = [];
    const padding = 8;
    
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

    // Calculate positions using spiral algorithm
    wordsToPosition.forEach((word, index) => {
      const fontSize = calculateFontSize(word, index, maxValue);
      const estimatedWidth = word.text.length * fontSize * 0.6;
      const estimatedHeight = fontSize * 1.2;
      
      let x, y;
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      // Try spiral positioning
      while (!placed && attempts < maxAttempts) {
        const angle = attempts * 0.3;
        const radius = attempts * 2;
        
        x = CANVAS_WIDTH / 2 + Math.cos(angle) * radius;
        y = CANVAS_HEIGHT / 2 + Math.sin(angle) * radius;
        
        // Check bounds
        if (x - estimatedWidth/2 < padding || 
            x + estimatedWidth/2 > CANVAS_WIDTH - padding ||
            y - estimatedHeight/2 < padding || 
            y + estimatedHeight/2 > CANVAS_HEIGHT - padding) {
          attempts++;
          continue;
        }
        
        // Check collision with existing words
        const collision = positions.some(pos => {
          const dx = Math.abs(x - pos.x);
          const dy = Math.abs(y - pos.y);
          const minDistanceX = (estimatedWidth + pos.width) / 2 + padding;
          const minDistanceY = (estimatedHeight + pos.height) / 2 + padding;
          
          return dx < minDistanceX && dy < minDistanceY;
        });
        
        if (!collision) {
          placed = true;
        } else {
          attempts++;
        }
      }
      
      // Fallback positioning if spiral fails
      if (!placed) {
        x = padding + (index % 20) * (CANVAS_WIDTH - 2 * padding) / 20;
        y = padding + Math.floor(index / 20) * 30;
      }
      
      positions.push({
        word,
        x,
        y,
        fontSize,
        width: estimatedWidth,
        height: estimatedHeight
      });
    });
    
    return positions;
  };

  // Update positions when data changes
  useEffect(() => {
    const processedWords = getProcessedWords();
    const positions = calculateAllPositions(processedWords);
    setWordPositions(positions);
  }, [words, searchTerm, selectedCountry, sortBy]);

  const processedWords = getProcessedWords();
  const availableCountries = Array.from(new Set(words.map(w => w.country).filter(Boolean)))
    .map(code => ({ code, name: COUNTRY_NAMES[code!] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate statistics
  const totalViews = processedWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
  const totalPosts = processedWords.reduce((sum, w) => sum + (w.publish_cnt || 0), 0);
  const avgRank = processedWords.length > 0 ? 
    processedWords.reduce((sum, w) => sum + (w.rank || 0), 0) / processedWords.length : 0;

  return (
    <div className="space-y-6">
      {/* Comprehensive Header */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            {title}
          </h2>
          
          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Hash className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="font-bold text-lg text-blue-900">{totalHashtags}</div>
              <div className="text-xs text-blue-700">Total Hashtags</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="font-bold text-lg text-green-900">{uniqueHashtags}</div>
              <div className="text-xs text-green-700">Unique Hashtags</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="font-bold text-lg text-purple-900">{(totalViews / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-purple-700">Total Views</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Users className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <div className="font-bold text-lg text-orange-900">{(totalPosts / 1000).toFixed(1)}K</div>
              <div className="text-xs text-orange-700">Total Posts</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <div className="font-bold text-lg text-gray-900">{avgRank.toFixed(1)}</div>
              <div className="text-xs text-gray-700">Avg Rank</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hashtags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Countries ({words.length})</option>
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
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="rank">Sort by Rank</option>
            <option value="views">Sort by Views</option>
            <option value="posts">Sort by Posts</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing: <strong className="ml-1">{processedWords.length}</strong> hashtags
          </div>
        </div>
      </div>

      {/* Complete WordCloud Canvas */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative bg-white rounded-xl border shadow-sm overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* All Hashtag Words */}
          {wordPositions.map((position, index) => {
            const word = position.word;
            return (
              <div
                key={`${word.text}-${word.country}-${index}`}
                className="absolute cursor-pointer select-none hover:z-10"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                onClick={() => {
                  setHoveredWord(word);
                  onShowAnalytics?.(word);
                }}
                onMouseEnter={() => setHoveredWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <div
                  className="px-2 py-1 rounded text-white font-medium hover:opacity-90"
                  style={{
                    backgroundColor: COUNTRY_COLORS[word.country || ''] || '#6b7280',
                    fontSize: `${position.fontSize}px`,
                    fontWeight: word.rank && word.rank <= 20 ? 'bold' : 'medium',
                    boxShadow: hoveredWord === word ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  #{word.text}
                </div>
                
                {/* Rank badge for top 20 */}
                {word.rank && word.rank <= 20 && (
                  <div 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-bold"
                    style={{ fontSize: '8px' }}
                  >
                    {word.rank}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Information Panel */}
        {hoveredWord && (
          <Card className="absolute bottom-4 left-4 right-4 bg-white shadow-xl border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-xl text-gray-900">#{hoveredWord.text}</span>
                    <Badge variant="secondary">Rank #{hoveredWord.rank}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    {hoveredWord.country && (
                      <Badge variant="outline" style={{ 
                        borderColor: COUNTRY_COLORS[hoveredWord.country],
                        color: COUNTRY_COLORS[hoveredWord.country]
                      }}>
                        {COUNTRY_NAMES[hoveredWord.country]}
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

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Video Views</div>
                      <div className="font-bold text-blue-600">
                        {hoveredWord.video_views ? (hoveredWord.video_views / 1000000).toFixed(2) + 'M' : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Posts</div>
                      <div className="font-bold text-green-600">
                        {hoveredWord.publish_cnt ? (hoveredWord.publish_cnt / 1000).toFixed(1) + 'K' : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {onShowAnalytics && (
                    <Button
                      onClick={() => onShowAnalytics(hoveredWord)}
                      className="w-full mt-2"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Country Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {availableCountries.map(country => {
          const countryWords = processedWords.filter(w => w.country === country.code);
          const countryViews = countryWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
          const countryPosts = countryWords.reduce((sum, w) => sum + (w.publish_cnt || 0), 0);
          const avgCountryRank = countryWords.length > 0 ? 
            countryWords.reduce((sum, w) => sum + (w.rank || 0), 0) / countryWords.length : 0;
          
          return (
            <Card key={country.code} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COUNTRY_COLORS[country.code!] }}
                />
                <div className="font-semibold text-sm mb-1">{country.name}</div>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-600">{countryWords.length} hashtags</div>
                  <div className="text-blue-600">{(countryViews / 1000000).toFixed(1)}M views</div>
                  <div className="text-green-600">{(countryPosts / 1000).toFixed(1)}K posts</div>
                  <div className="text-purple-600">Avg rank: {avgCountryRank.toFixed(1)}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-600">
            <strong>Complete Dataset Analysis:</strong> {processedWords.length} hashtags displayed • 
            Total {(totalViews / 1000000).toFixed(1)}M video views • 
            {(totalPosts / 1000).toFixed(1)}K posts across {availableCountries.length} countries
            {searchTerm && ` • Filtered by: "${searchTerm}"`}
            {selectedCountry !== "all" && ` • Country: ${COUNTRY_NAMES[selectedCountry]}`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
