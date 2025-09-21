"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users, Sparkles, Waves } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";

interface BubbleAnimatedWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

interface BubbleWordPosition {
  word: WordCloudData;
  x: number;
  y: number;
  fontSize: number;
  bubbleSize: number;
  opacity: number;
  delay: number;
  isVisible: boolean;
  floatSpeed: number;
  floatDirection: number;
  pulsePhase: number;
}

interface BackgroundBubble {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
  color: string;
}

export function BubbleAnimatedWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: BubbleAnimatedWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [bubblePositions, setBubblePositions] = useState<BubbleWordPosition[]>([]);
  const [backgroundBubbles, setBackgroundBubbles] = useState<BackgroundBubble[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const WORDS_PER_PAGE = 60;
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

  // Calculate bubble sizes
  const calculateBubbleSize = (word: WordCloudData, index: number, maxValue: number) => {
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
    
    // Bubble size progression
    if (normalizedValue > 0.8) return { fontSize: 24, bubbleSize: 120 };
    if (normalizedValue > 0.6) return { fontSize: 20, bubbleSize: 100 };
    if (normalizedValue > 0.4) return { fontSize: 18, bubbleSize: 85 };
    if (normalizedValue > 0.3) return { fontSize: 16, bubbleSize: 75 };
    if (normalizedValue > 0.2) return { fontSize: 14, bubbleSize: 65 };
    if (normalizedValue > 0.1) return { fontSize: 12, bubbleSize: 55 };
    if (normalizedValue > 0.05) return { fontSize: 11, bubbleSize: 50 };
    return { fontSize: 10, bubbleSize: 45 };
  };

  // Create background bubbles
  const createBackgroundBubbles = () => {
    const bubbles: BackgroundBubble[] = [];
    const colors = ['#e0f2fe', '#fef3c7', '#f3e8ff', '#ecfdf5', '#fef2f2', '#f0f9ff'];
    
    for (let i = 0; i < 25; i++) {
      bubbles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 40 + 20,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.2,
        direction: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return bubbles;
  };

  // Bubble positioning algorithm
  const calculateBubblePositions = (wordsToPosition: WordCloudData[]) => {
    const positions: BubbleWordPosition[] = [];
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const padding = 20;
    
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
      const { fontSize, bubbleSize } = calculateBubbleSize(word, index, maxValue);
      
      let x, y;
      let placed = false;
      let attempts = 0;
      
      // Bubble placement with collision detection
      while (!placed && attempts < 300) {
        if (attempts === 0 && index === 0) {
          // First bubble in center
          x = centerX;
          y = centerY;
        } else {
          // Random placement with preference for center
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.sqrt(Math.random()) * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.35;
          
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius;
        }
        
        // Check bounds
        if (x - bubbleSize/2 >= padding && 
            x + bubbleSize/2 <= CANVAS_WIDTH - padding &&
            y - bubbleSize/2 >= padding && 
            y + bubbleSize/2 <= CANVAS_HEIGHT - padding) {
          
          // Check collision with other bubbles
          const collision = positions.some(pos => {
            const dx = x - pos.x;
            const dy = y - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (bubbleSize + pos.bubbleSize) / 2 + padding;
            
            return distance < minDistance;
          });
          
          if (!collision) {
            placed = true;
          }
        }
        
        attempts++;
      }
      
      // Fallback to force placement
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
        bubbleSize,
        opacity: 0,
        delay: index * 100,
        isVisible: false,
        floatSpeed: Math.random() * 0.3 + 0.1,
        floatDirection: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2
      });
    });
    
    return positions;
  };

  // Animation loop for floating bubbles
  const animateFloatingBubbles = () => {
    setBubblePositions(prev => 
      prev.map(bubble => ({
        ...bubble,
        floatDirection: bubble.floatDirection + 0.01,
        pulsePhase: bubble.pulsePhase + 0.02
      }))
    );

    setBackgroundBubbles(prev => 
      prev.map(bubble => ({
        ...bubble,
        x: (bubble.x + Math.cos(bubble.direction) * bubble.speed + CANVAS_WIDTH) % CANVAS_WIDTH,
        y: (bubble.y + Math.sin(bubble.direction) * bubble.speed + CANVAS_HEIGHT) % CANVAS_HEIGHT,
        direction: bubble.direction + 0.005
      }))
    );

    animationRef.current = requestAnimationFrame(animateFloatingBubbles);
  };

  // Handle data changes and positioning
  useEffect(() => {
    const processedWords = getProcessedWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, processedWords.length);
    const currentWords = processedWords.slice(startIndex, endIndex);
    
    const positions = calculateBubblePositions(currentWords);
    setBubblePositions(positions);
    setBackgroundBubbles(createBackgroundBubbles());
    
    // Bubble entrance animation
    positions.forEach((position, index) => {
      setTimeout(() => {
        setBubblePositions(prev => 
          prev.map((pos, i) => 
            i === index ? { ...pos, opacity: 1, isVisible: true } : pos
          )
        );
      }, position.delay);
    });
  }, [words, currentPage, searchTerm, selectedCountry, sortBy]);

  // Start floating animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateFloatingBubbles);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
      {/* Bubble Header with Statistics */}
      <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50 rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Waves className="h-6 w-6 text-cyan-600" />
            {title} - Bubble View
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

      {/* Bubble WordCloud Canvas */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 rounded-xl border shadow-sm overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Background Floating Bubbles */}
          {backgroundBubbles.map((bubble, index) => (
            <div
              key={index}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                backgroundColor: bubble.color,
                opacity: bubble.opacity,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(1px)',
                animation: 'bubbleFloat 6s ease-in-out infinite',
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}

          {/* Hashtag Bubbles */}
          {bubblePositions.map((bubble, index) => {
            const word = bubble.word;
            const floatX = Math.cos(bubble.floatDirection) * 2;
            const floatY = Math.sin(bubble.floatDirection) * 1.5;
            const pulseScale = 1 + Math.sin(bubble.pulsePhase) * 0.05;
            const hoverScale = hoveredWord === word ? 1.15 : 1;
            
            return (
              <div
                key={`${word.text}-${word.country}-${index}`}
                className="absolute cursor-pointer select-none transition-all duration-500 hover:z-30"
                style={{
                  left: `${bubble.x + floatX}px`,
                  top: `${bubble.y + floatY}px`,
                  opacity: bubble.opacity,
                  transform: `translate(-50%, -50%) scale(${pulseScale * hoverScale})`,
                  animation: bubble.isVisible ? 'bubbleEntrance 1s ease-out forwards' : 'none',
                  animationDelay: `${bubble.delay}ms`,
                }}
                onClick={() => {
                  setHoveredWord(word);
                  onShowAnalytics?.(word);
                }}
                onMouseEnter={() => setHoveredWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                {/* Bubble Background */}
                <div
                  className="absolute inset-0 rounded-full shadow-lg transition-all duration-300"
                  style={{
                    width: `${bubble.bubbleSize}px`,
                    height: `${bubble.bubbleSize}px`,
                    background: `radial-gradient(circle at 30% 30%, ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}40, ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}80)`,
                    border: `2px solid ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}60`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: hoveredWord === word ? 
                      `0 0 30px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}60, 0 8px 25px rgba(0,0,0,0.15)` : 
                      `0 4px 15px ${COUNTRY_COLORS[word.country || ''] || '#6b7280'}30`,
                  }}
                />
                
                {/* Bubble Highlight */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${bubble.bubbleSize * 0.3}px`,
                    height: `${bubble.bubbleSize * 0.3}px`,
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.8), transparent)',
                    left: '25%',
                    top: '25%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />

                {/* Hashtag Text */}
                <div
                  className="absolute text-white font-bold text-center leading-tight pointer-events-none"
                  style={{
                    fontSize: `${bubble.fontSize}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    maxWidth: `${bubble.bubbleSize * 0.8}px`,
                    wordBreak: 'break-word',
                  }}
                >
                  #{word.text}
                </div>
                
                {/* Rank Badge */}
                {word.rank && word.rank <= 20 && (
                  <div 
                    className="absolute bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white transition-all duration-300"
                    style={{ 
                      fontSize: '10px',
                      width: '24px',
                      height: '24px',
                      right: '10%',
                      top: '10%',
                      transform: `translate(50%, -50%) scale(${hoveredWord === word ? 1.2 : 1})`,
                    }}
                  >
                    {word.rank}
                  </div>
                )}

                {/* Trend Indicator */}
                {word.trend === 'up' && (
                  <div 
                    className="absolute bg-green-500 rounded-full flex items-center justify-center shadow-md"
                    style={{
                      width: '20px',
                      height: '20px',
                      left: '10%',
                      top: '10%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <TrendingUp className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bubble Information Panel */}
        {hoveredWord && (
          <Card className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm shadow-xl border-2 border-cyan-200 transition-all duration-300">
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
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100">
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
                        {hoveredWord.trend === 'up' ? '↗ Bubbling Up' : 
                         hoveredWord.trend === 'down' ? '↘ Sinking' : '→ Stable'}
                      </Badge>
                    )}
                  </div>
                </div>

                {onShowAnalytics && (
                  <Button
                    onClick={() => onShowAnalytics(hoveredWord)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Bubble Analytics
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
