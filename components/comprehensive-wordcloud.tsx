"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, TrendingUp, TrendingDown, Eye, BarChart3, Search, Sparkles, Zap, Filter } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface ComprehensiveWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface PositionedWord extends WordCloudData {
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
}

export function ComprehensiveWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: ComprehensiveWordCloudProps) {
  const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  const WORDS_PER_PAGE = 60; // Increased for better analysis coverage
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 700;

  // Calculate dynamic font sizes with better distribution for comprehensive view
  const calculateFontSize = (word: WordCloudData, index: number) => {
    if (!word.rank) return 16;
    
    // More balanced sizing for comprehensive view
    if (word.rank <= 5) {
      return Math.max(36, 42 - word.rank); // 41, 40, 39, 38, 37
    }
    else if (word.rank <= 15) {
      return Math.max(28, 36 - (word.rank - 5) * 0.8); // 35, 34, 33...
    }
    else if (word.rank <= 30) {
      return Math.max(22, 28 - (word.rank - 15) * 0.4); // 27, 26, 25...
    }
    else if (word.rank <= 50) {
      return Math.max(18, 22 - (word.rank - 30) * 0.2); // 21, 20, 19...
    }
    else {
      return Math.max(14, 18 - (word.rank - 50) * 0.05);
    }
  };

  // Filter words based on search and country selection
  const getFilteredWords = () => {
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
    
    return filtered;
  };

  // Advanced grid-based positioning for better distribution
  const calculatePositions = (wordsToPosition: WordCloudData[]) => {
    const positioned: PositionedWord[] = [];
    const gridCols = 12;
    const gridRows = 8;
    const cellWidth = CANVAS_WIDTH / gridCols;
    const cellHeight = CANVAS_HEIGHT / gridRows;
    const occupiedCells = new Set<string>();

    // Sort by rank to position important words first
    const sortedWords = [...wordsToPosition].sort((a, b) => (a.rank || 999) - (b.rank || 999));

    sortedWords.forEach((word, index) => {
      const fontSize = calculateFontSize(word, index);
      let cellX, cellY, attempts = 0;
      const maxAttempts = 50;

      // Try to find an unoccupied cell
      do {
        if (attempts < 20) {
          // First try center area for important words
          const centerBias = Math.max(0, 1 - (word.rank || 0) / 20);
          const centerX = gridCols / 2;
          const centerY = gridRows / 2;
          const radius = (1 - centerBias) * Math.min(gridCols, gridRows) / 2;
          
          cellX = Math.floor(centerX + (Math.random() - 0.5) * radius * 2);
          cellY = Math.floor(centerY + (Math.random() - 0.5) * radius * 2);
        } else {
          // Fallback to random positioning
          cellX = Math.floor(Math.random() * gridCols);
          cellY = Math.floor(Math.random() * gridRows);
        }

        cellX = Math.max(0, Math.min(gridCols - 1, cellX));
        cellY = Math.max(0, Math.min(gridRows - 1, cellY));
        attempts++;
      } while (occupiedCells.has(`${cellX}-${cellY}`) && attempts < maxAttempts);

      // Mark cells as occupied (including adjacent cells for larger words)
      const cellsToOccupy = fontSize > 30 ? 2 : fontSize > 20 ? 1 : 0;
      for (let dx = -cellsToOccupy; dx <= cellsToOccupy; dx++) {
        for (let dy = -cellsToOccupy; dy <= cellsToOccupy; dy++) {
          const newX = cellX + dx;
          const newY = cellY + dy;
          if (newX >= 0 && newX < gridCols && newY >= 0 && newY < gridRows) {
            occupiedCells.add(`${newX}-${newY}`);
          }
        }
      }

      const x = cellX * cellWidth + cellWidth / 2;
      const y = cellY * cellHeight + cellHeight / 2;

      positioned.push({
        ...word,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        fontSize,
        opacity: 0,
      });
    });

    return positioned;
  };

  // Handle pagination and positioning - no animations
  useEffect(() => {
    const filteredWords = getFilteredWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, filteredWords.length);
    const currentWords = filteredWords.slice(startIndex, endIndex);

    const positioned = calculatePositions(currentWords);
    
    // Set all words visible immediately - no animation
    const finalPositioned = positioned.map(word => ({
      ...word,
      opacity: 1
    }));
    
    setPositionedWords(finalPositioned);
  }, [words, currentPage, searchTerm, selectedCountry]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCountry]);

  const getWordColor = (word: WordCloudData) => {
    return COUNTRY_COLORS[word.country || ''] || '#6b7280';
  };

  const filteredWords = getFilteredWords();
  const totalPages = Math.ceil(filteredWords.length / WORDS_PER_PAGE);

  // Get unique countries from current words
  const availableCountries = Array.from(new Set(words.map(w => w.country).filter(Boolean)))
    .map(code => ({ code, name: COUNTRY_NAMES[code!] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      {/* Clean Header for Analysis */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              {title}
            </h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Total: {totalHashtags} hashtags</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="font-medium">Unique: {uniqueHashtags} hashtags</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Showing: {filteredWords.length} hashtags</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search hashtags or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="all">All Countries</option>
              {availableCountries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                ←
              </Button>
              <span className="px-3 py-1 bg-white/80 rounded text-sm font-medium">
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

        {/* Active Filters Display */}
        {(searchTerm || selectedCountry !== "all") && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCountry !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Country: {COUNTRY_NAMES[selectedCountry]}
                <button 
                  onClick={() => setSelectedCountry("all")}
                  className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Clean WordCloud Canvas for Analysis */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative bg-gray-50 rounded-xl border shadow-sm overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Subtle grid for structure */}
          <div className="absolute inset-0 opacity-[0.03]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-gray-300"
                style={{ left: `${(i + 1) * (100 / 6)}%` }}
              />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-px bg-gray-300"
                style={{ top: `${(i + 1) * (100 / 4)}%` }}
              />
            ))}
          </div>

          {/* Static Hashtag Words - Traditional Wordcloud Style */}
          {positionedWords.map((word, index) => (
            <div
              key={`${word.text}-${word.country}-${index}`}
              className="absolute cursor-pointer select-none hover:z-10"
              style={{
                left: `${word.x}px`,
                top: `${word.y}px`,
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
                className="px-2 py-1 rounded-md text-white font-medium shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: getWordColor(word),
                  fontSize: `${word.fontSize}px`,
                  opacity: hoveredWord === word ? 0.9 : 0.8,
                  fontWeight: word.rank && word.rank <= 10 ? 'bold' : 'medium',
                }}
              >
                #{word.text}
              </div>
              
              {/* Minimal rank indicator for top 10 only */}
              {word.rank && word.rank <= 10 && (
                <div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ fontSize: '8px' }}
                >
                  {word.rank}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Clean Information Panel */}
        {hoveredWord && (
          <Card className="absolute bottom-4 left-4 right-4 bg-white shadow-lg border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-gray-600" />
                  <span className="font-bold text-lg text-gray-900">
                    #{hoveredWord.text}
                  </span>
                  
                  <Badge variant="secondary" className="font-medium">
                    Rank #{hoveredWord.rank}
                  </Badge>

                  {hoveredWord.country && (
                    <Badge variant="outline">
                      {COUNTRY_NAMES[hoveredWord.country]}
                    </Badge>
                  )}

                  {hoveredWord.video_views && (
                    <Badge variant="outline" className="text-blue-600">
                      {(hoveredWord.video_views / 1000000).toFixed(1)}M views
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
                      className="font-medium"
                    >
                      {hoveredWord.trend === 'up' ? '↗ Trending' : 
                       hoveredWord.trend === 'down' ? '↘ Declining' : '→ Stable'}
                    </Badge>
                  )}
                </div>

                {onShowAnalytics && (
                  <Button
                    onClick={() => onShowAnalytics(hoveredWord)}
                    className="flex items-center gap-2"
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

      {/* Summary Statistics for Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(COUNTRY_COLORS).slice(0, 5).map(([code, color]) => {
          const countryWords = filteredWords.filter(w => w.country === code);
          const totalViews = countryWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
          const avgRank = countryWords.length > 0 ? 
            countryWords.reduce((sum, w) => sum + (w.rank || 0), 0) / countryWords.length : 0;
          
          return (
            <Card key={code} className="text-center">
              <CardContent className="p-4">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: color }}
                />
                <div className="font-semibold text-sm">{COUNTRY_NAMES[code]}</div>
                <div className="text-xs text-gray-600">{countryWords.length} hashtags</div>
                <div className="text-xs text-blue-600">
                  {(totalViews / 1000000).toFixed(1)}M views
                </div>
                <div className="text-xs text-purple-600">
                  Avg rank: {avgRank.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 bg-white p-4 rounded-lg border">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages} • Showing {positionedWords.length} hashtags
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
