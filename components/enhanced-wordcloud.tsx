"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface EnhancedWordCloudProps {
  words: WordCloudData[];
  width?: number;
  height?: number;
  selectedCountries?: string[];
}

interface PositionedWord extends WordCloudData {
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  finalX: number;
  finalY: number;
}

export function EnhancedWordCloud({
  words,
  width = 1000,
  height = 500,
  selectedCountries = ['MY', 'SG', 'TH', 'TW', 'KR']
}: EnhancedWordCloudProps) {
  const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic font sizes with better distribution
  const calculateFontSize = (word: WordCloudData) => {
    if (!word.rank) return 14;
    
    // More aggressive size differences for better visibility
    if (word.rank <= 3) {
      return Math.max(42, 48 - word.rank * 2); // 46, 44, 42
    }
    else if (word.rank <= 8) {
      return Math.max(32, 42 - (word.rank - 3) * 2); // 40, 38, 36, 34, 32
    }
    else if (word.rank <= 15) {
      return Math.max(24, 32 - (word.rank - 8) * 1); // 31, 30, 29... 24
    }
    else if (word.rank <= 30) {
      return Math.max(18, 24 - (word.rank - 15) * 0.4); // 23.6, 23.2... 18
    }
    else {
      return Math.max(14, 18 - (word.rank - 30) * 0.1);
    }
  };

  // Improved positioning algorithm to prevent overlaps
  const calculatePositions = (wordsToPosition: WordCloudData[]) => {
    const positioned: PositionedWord[] = [];
    const padding = 15;
    const centerX = width / 2;
    const centerY = height / 2;

    // Sort by rank to position important words first
    const sortedWords = [...wordsToPosition].sort((a, b) => (a.rank || 999) - (b.rank || 999));

    sortedWords.forEach((word, index) => {
      const fontSize = calculateFontSize(word);
      let x, y;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        // Use spiral positioning for better distribution
        const angle = index * 0.5;
        const radius = Math.min(attempts * 3, Math.min(width, height) / 3);
        
        x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 100;
        y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 100;

        // Ensure within bounds
        x = Math.max(fontSize, Math.min(width - fontSize * 3, x));
        y = Math.max(fontSize, Math.min(height - fontSize, y));

        attempts++;
      } while (attempts < maxAttempts && isOverlapping(x, y, fontSize, positioned, padding));

      positioned.push({
        ...word,
        x: Math.random() * width, // Start from random position
        y: Math.random() * height,
        finalX: x,
        finalY: y,
        fontSize,
        opacity: 0,
      });
    });

    return positioned;
  };

  // Check if position overlaps with existing words
  const isOverlapping = (x: number, y: number, fontSize: number, existing: PositionedWord[], padding: number) => {
    const wordWidth = fontSize * 0.6; // Approximate character width
    const wordHeight = fontSize;

    return existing.some(existing => {
      const existingWidth = existing.fontSize * 0.6;
      const existingHeight = existing.fontSize;
      
      return !(x + wordWidth + padding < existing.finalX ||
               x - padding > existing.finalX + existingWidth ||
               y + wordHeight + padding < existing.finalY ||
               y - padding > existing.finalY + existingHeight);
    });
  };

  // Filter and position words
  useEffect(() => {
    const filteredWords = words
      .filter(word => selectedCountries.includes(word.country || ''))
      .slice(0, 40); // Limit for better performance and clarity

    const positioned = calculatePositions(filteredWords);
    setPositionedWords(positioned);

    // Animate words into position
    const animatePositions = () => {
      positioned.forEach((word, index) => {
        setTimeout(() => {
          setPositionedWords(prev => 
            prev.map((w, i) => 
              i === index 
                ? { 
                    ...w, 
                    x: w.finalX, 
                    y: w.finalY, 
                    opacity: 1 
                  }
                : w
            )
          );
        }, index * 100);
      });
    };

    animatePositions();
  }, [words, selectedCountries, width, height]);

  const getWordColor = (word: WordCloudData) => {
    return COUNTRY_COLORS[word.country || ''] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Country Legend */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Countries:</span>
        {selectedCountries.map(countryCode => (
          <div key={countryCode} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COUNTRY_COLORS[countryCode] }}
            />
            <span className="text-sm text-gray-600">
              {COUNTRY_NAMES[countryCode]}
            </span>
          </div>
        ))}
      </div>

      {/* Enhanced WordCloud */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border shadow-lg overflow-hidden"
          style={{ width: width, height: height }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-8 left-8 w-16 h-16 bg-blue-400 rounded-full blur-xl"></div>
            <div className="absolute top-20 right-12 w-12 h-12 bg-purple-400 rounded-full blur-lg"></div>
            <div className="absolute bottom-12 left-16 w-10 h-10 bg-pink-400 rounded-full blur-lg"></div>
            <div className="absolute bottom-8 right-8 w-20 h-20 bg-green-400 rounded-full blur-xl"></div>
          </div>

          {/* Hashtag bubbles */}
          {positionedWords.map((word, index) => (
            <div
              key={`${word.text}-${word.country}-${index}`}
              className="absolute cursor-pointer transition-all duration-500 ease-out hover:scale-110 hover:z-10"
              style={{
                left: `${word.x}px`,
                top: `${word.y}px`,
                opacity: word.opacity,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => setHoveredWord(word)}
              onMouseEnter={() => setHoveredWord(word)}
              onMouseLeave={() => setHoveredWord(null)}
            >
              <div
                className="px-4 py-2 rounded-full text-white font-bold shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: getWordColor(word),
                  fontSize: `${word.fontSize}px`,
                  boxShadow: `0 8px 32px ${getWordColor(word)}40`,
                  border: `2px solid ${getWordColor(word)}20`,
                }}
              >
                #{word.text}
              </div>
              
              {/* Rank indicator for top hashtags */}
              {word.rank && word.rank <= 10 && (
                <div 
                  className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                >
                  {word.rank}
                </div>
              )}
            </div>
          ))}

          {/* Grid lines for better structure */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-gray-300"
                style={{ top: `${(i + 1) * 20}%` }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-px bg-gray-300"
                style={{ left: `${(i + 1) * 20}%` }}
              />
            ))}
          </div>
        </div>

        {/* Hover information */}
        {hoveredWord && (
          <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl">
            <div className="flex items-center gap-3 flex-wrap">
              <Hash className="h-5 w-5 text-gray-600" />
              <span className="font-bold text-xl text-gray-900">
                #{hoveredWord.text}
              </span>
              
              <Badge 
                variant="secondary" 
                className="font-medium"
                style={{ 
                  backgroundColor: `${getWordColor(hoveredWord)}20`,
                  color: getWordColor(hoveredWord),
                  borderColor: `${getWordColor(hoveredWord)}40`
                }}
              >
                Rank #{hoveredWord.rank}
              </Badge>

              {hoveredWord.country && (
                <Badge variant="outline" className="font-medium">
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
          </div>
        )}
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {selectedCountries.map(countryCode => {
          const countryWords = positionedWords.filter(w => w.country === countryCode);
          const totalViews = countryWords.reduce((sum, w) => sum + (w.video_views || 0), 0);
          
          return (
            <div key={countryCode} className="text-center p-3 bg-white rounded-lg border">
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: COUNTRY_COLORS[countryCode] }}
              />
              <div className="font-semibold text-sm">{COUNTRY_NAMES[countryCode]}</div>
              <div className="text-xs text-gray-600">{countryWords.length} hashtags</div>
              <div className="text-xs text-blue-600">
                {(totalViews / 1000000).toFixed(1)}M views
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
