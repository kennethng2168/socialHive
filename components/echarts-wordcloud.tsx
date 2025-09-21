"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hash, Search, Filter, BarChart3, Eye, TrendingUp, Users, Sparkles, Cloud } from "lucide-react";
import { WordCloudData, COUNTRY_NAMES, COUNTRY_COLORS } from "@/lib/data-parser";
import * as echarts from 'echarts';

interface EChartsWordCloudProps {
  words: WordCloudData[];
  title: string;
  totalHashtags: number;
  uniqueHashtags: number;
  onShowAnalytics?: (hashtag: WordCloudData) => void;
}

export default function EChartsWordCloud({
  words,
  title,
  totalHashtags,
  uniqueHashtags,
  onShowAnalytics
}: EChartsWordCloudProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rank" | "views" | "posts">("rank");
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [wordShape, setWordShape] = useState<string>("circle");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

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

  // Calculate value for ECharts wordcloud
  const calculateWordValue = (word: WordCloudData) => {
    let value;
    switch (sortBy) {
      case "views":
        value = Math.log10(Math.max(1, word.video_views || 1)) * 10;
        break;
      case "posts":
        value = Math.log10(Math.max(1, word.publish_cnt || 1)) * 15;
        break;
      case "rank":
      default:
        value = Math.max(10, 200 - Math.min(999, Math.max(1, word.rank || 999)));
        break;
    }
    
    // Ensure value is a valid positive number
    return Math.max(1, Math.min(1000, Math.round(value)));
  };

  // Prepare data for ECharts
  const prepareEChartsData = () => {
    const processedWords = getProcessedWords();
    const startIndex = currentPage * WORDS_PER_PAGE;
    const endIndex = Math.min(startIndex + WORDS_PER_PAGE, processedWords.length);
    const currentWords = processedWords.slice(startIndex, endIndex);
    
    // Filter out invalid words and ensure valid data
    const validWords = currentWords.filter(word => 
      word && 
      word.text && 
      typeof word.text === 'string' && 
      word.text.trim().length > 0 &&
      word.text.length < 50 // Prevent extremely long words
    );
    
    return validWords.map(word => {
      const value = calculateWordValue(word);
      return {
        name: word.text.trim(),
        value: value,
        textStyle: {
          color: COUNTRY_COLORS[word.country || ''] || '#6b7280',
          fontWeight: word.rank && word.rank <= 10 ? 'bold' : 'normal',
          fontSize: word.rank && word.rank <= 5 ? 'larger' : 'normal'
        },
        emphasis: {
          textStyle: {
            color: '#000000',
            textShadowBlur: 10,
            textShadowColor: COUNTRY_COLORS[word.country || ''] || '#6b7280'
          }
        },
        // Store original word data for click events
        originalData: word
      };
    });
  };

  // Initialize and update ECharts
  useEffect(() => {
    if (!chartRef.current || typeof window === 'undefined') {
      console.log('Chart ref or window not available');
      return;
    }

    console.log('Initializing ECharts with words:', words.length);

    // Load wordcloud plugin and initialize chart
    const initializeChart = async () => {
      try {
        // Dynamically import echarts-wordcloud
        await import('echarts-wordcloud');
        console.log('ECharts wordcloud plugin loaded');

        // Initialize chart if not exists
        if (!chartInstanceRef.current && chartRef.current) {
          console.log('Creating new ECharts instance');
          
          // Ensure the container has proper dimensions
          const container = chartRef.current;
          if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            console.error('Chart container has invalid dimensions:', container.offsetWidth, container.offsetHeight);
            return;
          }
          
          chartInstanceRef.current = echarts.init(container, null, {
            width: Math.floor(container.offsetWidth),
            height: Math.floor(container.offsetHeight),
            devicePixelRatio: 1 // Fixed to 1 to prevent Canvas issues
          });
        
            // Add click event listener
            chartInstanceRef.current.on('click', (params: any) => {
              const originalWord = params.data.originalData;
              if (originalWord && onShowAnalytics) {
                setHoveredWord(originalWord);
                onShowAnalytics(originalWord);
              }
            });

            // Add mouseover event listener
            chartInstanceRef.current.on('mouseover', (params: any) => {
              const originalWord = params.data.originalData;
              if (originalWord) {
                setHoveredWord(originalWord);
              }
            });

            // Add mouseout event listener
            chartInstanceRef.current.on('mouseout', () => {
              setHoveredWord(null);
            });
          }

          const chartData = prepareEChartsData();
          console.log('Chart data prepared:', chartData.length, chartData.slice(0, 3));
          
          // Ensure we have valid data
          if (!chartData || chartData.length === 0) {
            console.warn('No valid chart data available');
            return;
          }
          
          const option = {
            backgroundColor: 'transparent',
            tooltip: {
              show: true,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              textStyle: {
                color: '#374151',
                fontSize: 12
              },
              formatter: (params: any) => {
                const word = params.data.originalData;
                if (!word) return params.name;
                
                return `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                      #${word.text}
                    </div>
                    <div style="margin-bottom: 2px;">
                      <span style="color: ${COUNTRY_COLORS[word.country || '']};">●</span>
                      ${COUNTRY_NAMES[word.country || ''] || 'Unknown'}
                    </div>
                    <div style="margin-bottom: 2px;">Rank: #${word.rank || 'N/A'}</div>
                    ${word.video_views ? `<div style="margin-bottom: 2px;">Views: ${(word.video_views / 1000000).toFixed(2)}M</div>` : ''}
                    ${word.publish_cnt ? `<div style="margin-bottom: 2px;">Posts: ${(word.publish_cnt / 1000).toFixed(1)}K</div>` : ''}
                    ${word.trend ? `<div>Trend: ${word.trend === 'up' ? '↗ Rising' : word.trend === 'down' ? '↘ Falling' : '→ Stable'}</div>` : ''}
                  </div>
                `;
              }
            },
            series: [{
              type: 'wordCloud',
              shape: 'circle', // Fixed to circle to prevent shape-related Canvas issues
              keepAspect: false,
              left: 60,
              top: 40,
              width: 680, // Fixed width
              height: 520, // Fixed height
              right: null,
              bottom: null,
              sizeRange: [16, 48], // Conservative range
              rotationRange: [0, 0], // No rotation to prevent Canvas issues
              rotationStep: 0,
              gridSize: 16, // Larger grid for stability
              drawOutOfBound: false,
              shrinkToFit: true,
              layoutAnimation: false,
              autoSize: {
                enable: true,
                minSize: 16
              },
              textStyle: {
                fontFamily: 'Arial, sans-serif', // Simple font
                fontWeight: 'normal'
              },
              emphasis: {
                focus: 'self',
                textStyle: {
                  fontWeight: 'bold'
                }
              },
              data: chartData.slice(0, 50) // Further reduced for stability
            }],
            animationDuration: 500,
            animationEasing: 'cubicOut'
          };

          try {
            console.log('Setting ECharts option');
            
            // Add a small delay to ensure Canvas is ready
            setTimeout(() => {
              if (chartInstanceRef.current) {
                try {
                  chartInstanceRef.current.setOption(option, true);
                  console.log('ECharts option set successfully');
                } catch (canvasError) {
                  console.warn('Canvas error occurred, trying fallback:', canvasError);
                  
                  // Fallback: try with minimal configuration
                  const fallbackOption = {
                    ...option,
                    series: [{
                      ...option.series[0],
                      data: chartData.slice(0, 20), // Even fewer words
                      sizeRange: [20, 30], // Smaller range
                      textStyle: {
                        fontFamily: 'Arial',
                        fontSize: 16
                      }
                    }]
                  };
                  
                  try {
                    chartInstanceRef.current.setOption(fallbackOption, true);
                    console.log('Fallback option set successfully');
                  } catch (fallbackError) {
                    console.error('Both normal and fallback options failed:', fallbackError);
                  }
                }
              }
            }, 100);
            
          } catch (error) {
            console.error('Error setting ECharts option:', error);
          }
          
        } catch (error) {
          console.error('Error initializing ECharts wordcloud:', error);
        }
      };

      initializeChart();

      // Handle resize
      const handleResize = () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.resize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [words, currentPage, searchTerm, selectedCountry, sortBy, wordShape, onShowAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
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

  const shapes = [
    { value: 'circle', label: 'Circle' },
    { value: 'cardioid', label: 'Heart' },
    { value: 'diamond', label: 'Diamond' },
    { value: 'triangle-forward', label: 'Triangle' },
    { value: 'pentagon', label: 'Pentagon' },
    { value: 'star', label: 'Star' }
  ];

  return (
    <div className="space-y-6">
      {/* ECharts Header with Statistics */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-xl p-6 border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Cloud className="h-6 w-6 text-indigo-600" />
            {title} - ECharts WordCloud
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <select
            value={wordShape}
            onChange={(e) => setWordShape(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white/90 backdrop-blur-sm"
          >
            {shapes.map(shape => (
              <option key={shape.value} value={shape.value}>
                Shape: {shape.label}
              </option>
            ))}
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

      {/* ECharts WordCloud Canvas */}
      <div className="relative">
        <div
          ref={chartRef}
          className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl border shadow-sm"
          style={{ 
            width: '100%', 
            height: '700px',
            minWidth: '800px',
            minHeight: '600px',
            position: 'relative'
          }}
        />

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
                    Deep Analytics
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
