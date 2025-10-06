"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Hash, MessageCircle, Globe, BarChart3 } from "lucide-react";
import { 
  loadRegionalData, 
  WordCloudData, 
  REGIONS, 
  COUNTRY_NAMES,
  COUNTRY_COLORS 
} from "@/lib/data-parser";
import dynamic from "next/dynamic";

const ReactWordCloudComponent = dynamic(() => import("./react-wordcloud-component"), {
  ssr: false,
  loading: () => (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-xl border shadow-sm flex items-center justify-center" style={{ height: '600px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading WordCloud...</p>
      </div>
    </div>
  ),
});

interface WordData {
  text: string;
  value: number;
  color?: string;
  country?: string;
  region?: string;
  rank?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface AnimatedWordData extends WordData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fontSize: number;
  opacity: number;
  animationDelay: number;
}

interface WordCloudProps {
  words: WordData[];
  width?: number;
  height?: number;
  animated?: boolean;
}

export function WordCloud({
  words,
  width = 800,
  height = 400,
  animated = true,
}: WordCloudProps) {
  const [animatedWords, setAnimatedWords] = useState<AnimatedWordData[]>([]);
  const [hoveredWord, setHoveredWord] = useState<WordData | null>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#ff4458", // red/pink
    "#fbbf24", // yellow
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#f97316", // orange
    "#06b6d4", // cyan
    "#ef4444", // red
  ];

  // Calculate dynamic font sizes based on rank and value
  const calculateFontSize = (word: WordData, index: number) => {
    if (!word.rank) return 16;
    
    // Top 5 hashtags get significantly larger sizes
    if (word.rank <= 5) {
      return Math.max(28, 40 - word.rank * 2); // 38, 36, 34, 32, 30
    }
    // Top 10 get medium-large sizes
    else if (word.rank <= 10) {
      return Math.max(22, 30 - (word.rank - 5) * 1.5); // 28, 26, 24, 22, 20
    }
    // Top 20 get medium sizes
    else if (word.rank <= 20) {
      return Math.max(16, 22 - (word.rank - 10) * 0.5); // 20, 19, 18, 17, 16
    }
    // Rest get smaller sizes
    else {
      return Math.max(12, 16 - (word.rank - 20) * 0.1);
    }
  };

  // Initialize animated words
  useEffect(() => {
    if (!animated) return;

    // Limit to top 25 hashtags to reduce clutter
    const initialWords: AnimatedWordData[] = words.slice(0, 25).map((word, index) => {
      const fontSize = calculateFontSize(word, index);
      return {
        ...word,
        x: Math.random() * (width - 200) + 100,
        y: Math.random() * (height - 120) + 60,
        vx: (Math.random() - 0.5) * 0.3, // Slower movement
        vy: (Math.random() - 0.5) * 0.3,
        fontSize,
        color: word.color || colors[index % colors.length],
        opacity: 0,
        animationDelay: index * 150, // Longer delay between appearances
      };
    });

    setAnimatedWords(initialWords);

    // Animate opacity in
    initialWords.forEach((word, index) => {
      setTimeout(() => {
        setAnimatedWords(prev => 
          prev.map((w, i) => i === index ? { ...w, opacity: 1 } : w)
        );
      }, word.animationDelay);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [words, width, height, animated]);

  // Animation loop for floating effect
  useEffect(() => {
    if (!animated) return;

    const animate = () => {
      setAnimatedWords(prev => prev.map(word => {
        let newX = word.x + word.vx;
        let newY = word.y + word.vy;
        let newVx = word.vx;
        let newVy = word.vy;

        // Bounce off edges
        if (newX <= 0 || newX >= width - 100) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(width - 100, newX));
        }
        if (newY <= 0 || newY >= height - 50) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(height - 50, newY));
        }

        return {
          ...word,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    if (animatedWords.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animatedWords.length, width, height, animated]);

  const staticBubbleWords = words.slice(0, 30).map((word, index) => {
    const fontSize = calculateFontSize(word, index);

    return {
      ...word,
      color: word.color || colors[index % colors.length],
      fontSize: fontSize,
      padding: Math.max(6, fontSize / 3), // Dynamic padding based on font size
    };
  });

  if (!animated) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 relative overflow-hidden border"
            style={{ width: width, height: height }}
          >
            <div className="flex flex-wrap gap-3 justify-center items-center h-full">
              {staticBubbleWords.map((word, index) => (
                <div
                  key={word.text}
                  className="cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
                  onClick={() => setHoveredWord(word)}
                  style={{
                    backgroundColor: word.color,
                    borderRadius: "50px",
                    padding: `${word.padding}px ${word.padding + 6}px`,
                    fontSize: `${word.fontSize}px`,
                    color: "white",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  #{word.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {hoveredWord && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                #{hoveredWord.text}
              </span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {hoveredWord.value}K posts
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl relative overflow-hidden border shadow-lg"
          style={{ width: width, height: height }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 bg-pink-400 rounded-full"></div>
            <div className="absolute top-12 right-8 w-6 h-6 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-8 left-12 w-4 h-4 bg-blue-400 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 bg-yellow-400 rounded-full"></div>
          </div>

          {/* Animated hashtag bubbles */}
          {animatedWords.map((word, index) => (
            <div
              key={`${word.text}-${index}`}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 float-animation"
              style={{
                left: `${word.x}px`,
                top: `${word.y}px`,
                opacity: word.opacity,
                transform: `translate(-50%, -50%)`,
                animationDelay: `${index * 0.5}s`,
              }}
              onClick={() => setHoveredWord(word)}
              onMouseEnter={() => setHoveredWord(word)}
            >
              <div
                className="px-4 py-2 rounded-full text-white font-semibold shadow-lg transform transition-transform duration-200"
                style={{
                  backgroundColor: word.color,
                  fontSize: `${word.fontSize}px`,
                  boxShadow: `0 4px 15px ${word.color}30`,
                }}
              >
                #{word.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hoveredWord && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-pink-600" />
            <span className="font-semibold text-gray-900">
              #{hoveredWord.text}
            </span>
            <Badge 
              variant="secondary" 
              className="bg-pink-100 text-pink-800 font-medium"
            >
              Score: {hoveredWord.value}
            </Badge>
            {hoveredWord.country && (
              <Badge variant="outline" className="text-xs">
                {COUNTRY_NAMES[hoveredWord.country] || hoveredWord.country}
              </Badge>
            )}
            {hoveredWord.region && (
              <Badge variant="outline" className="text-xs">
                {REGIONS[hoveredWord.region]?.name || hoveredWord.region}
              </Badge>
            )}
            {hoveredWord.rank && (
              <Badge variant="secondary" className="text-xs">
                Rank #{hoveredWord.rank}
              </Badge>
            )}
            {hoveredWord.trend && (
              <Badge 
                variant={hoveredWord.trend === 'up' ? 'default' : hoveredWord.trend === 'down' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {hoveredWord.trend === 'up' ? '↗ Trending' : hoveredWord.trend === 'down' ? '↘ Declining' : '→ Stable'}
              </Badge>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Sample data for TikTok hashtags analytics
const sampleHashtagData: WordData[] = [
  { text: "nepal", value: 250, color: "#3b82f6" },
  { text: "genz", value: 180, color: "#ef4444" },
  { text: "viral", value: 150, color: "#10b981" },
  { text: "fyp", value: 120, color: "#f59e0b" },
  { text: "trending", value: 100, color: "#8b5cf6" },
  { text: "dance", value: 85, color: "#06b6d4" },
  { text: "comedy", value: 75, color: "#f97316" },
  { text: "music", value: 70, color: "#84cc16" },
  { text: "fashion", value: 65, color: "#ec4899" },
  { text: "food", value: 60, color: "#6b7280" },
  { text: "tutorial", value: 55, color: "#3b82f6" },
  { text: "lifestyle", value: 50, color: "#ef4444" },
  { text: "travel", value: 45, color: "#10b981" },
  { text: "fitness", value: 40, color: "#f59e0b" },
  { text: "beauty", value: 35, color: "#8b5cf6" },
  { text: "tech", value: 30, color: "#fbbf24" },
  { text: "pets", value: 25, color: "#10b981" },
  { text: "art", value: 20, color: "#f97316" },
  { text: "diy", value: 18, color: "#8b5cf6" },
  { text: "gaming", value: 15, color: "#06b6d4" },
  { text: "nature", value: 12, color: "#ec4899" },
  { text: "motivation", value: 10, color: "#6b7280" },
  { text: "sports", value: 8, color: "#3b82f6" },
  { text: "cooking", value: 6, color: "#ef4444" },
  { text: "business", value: 5, color: "#10b981" },
  { text: "photography", value: 4, color: "#f59e0b" },
  { text: "wellness", value: 3, color: "#8b5cf6" },
];

const sampleKeywordData: WordData[] = [
  { text: "amazing", value: 85, color: "#3b82f6" },
  { text: "love", value: 78, color: "#ef4444" },
  { text: "best", value: 72, color: "#10b981" },
  { text: "perfect", value: 68, color: "#f59e0b" },
  { text: "awesome", value: 62, color: "#8b5cf6" },
  { text: "incredible", value: 58, color: "#06b6d4" },
  { text: "beautiful", value: 54, color: "#f97316" },
  { text: "fantastic", value: 50, color: "#84cc16" },
  { text: "wonderful", value: 46, color: "#ec4899" },
  { text: "stunning", value: 42, color: "#6b7280" },
  { text: "brilliant", value: 38, color: "#3b82f6" },
  { text: "excellent", value: 34, color: "#ef4444" },
  { text: "outstanding", value: 30, color: "#10b981" },
  { text: "spectacular", value: 26, color: "#f59e0b" },
  { text: "magnificent", value: 22, color: "#8b5cf6" },
];

// Sample data for the ranking table
const sampleRankingData = [
  {
    rank: 1,
    hashtag: "#nepal",
    posts: "3K",
    trend: "down",
    trendValue: 5,
    creators: [
      { name: "Creator 1", avatar: "/placeholder-user.jpg" },
      { name: "Creator 2", avatar: "/placeholder-user.jpg" },
      { name: "Creator 3", avatar: "/placeholder-user.jpg" },
    ],
    isNewToTop100: false,
  },
  {
    rank: 2,
    hashtag: "#genz",
    posts: "2K",
    trend: "down",
    trendValue: 3,
    creators: [
      { name: "Creator 4", avatar: "/placeholder-user.jpg" },
      { name: "Creator 5", avatar: "/placeholder-user.jpg" },
      { name: "Creator 6", avatar: "/placeholder-user.jpg" },
    ],
    isNewToTop100: false,
  },
  {
    rank: 3,
    hashtag: "#viral",
    posts: "1.8K",
    trend: "up",
    trendValue: 2,
    creators: [
      { name: "Creator 7", avatar: "/placeholder-user.jpg" },
      { name: "Creator 8", avatar: "/placeholder-user.jpg" },
      { name: "Creator 9", avatar: "/placeholder-user.jpg" },
    ],
    isNewToTop100: true,
  },
  {
    rank: 4,
    hashtag: "#trending",
    posts: "1.5K",
    trend: "up",
    trendValue: 1,
    creators: [
      { name: "Creator 10", avatar: "/placeholder-user.jpg" },
      { name: "Creator 11", avatar: "/placeholder-user.jpg" },
      { name: "Creator 12", avatar: "/placeholder-user.jpg" },
    ],
    isNewToTop100: false,
  },
  {
    rank: 5,
    hashtag: "#fyp",
    posts: "1.2K",
    trend: "down",
    trendValue: 1,
    creators: [
      { name: "Creator 13", avatar: "/placeholder-user.jpg" },
      { name: "Creator 14", avatar: "/placeholder-user.jpg" },
      { name: "Creator 15", avatar: "/placeholder-user.jpg" },
    ],
    isNewToTop100: false,
  },
];

// Hashtag ranking table component
function HashtagRankingTable({ 
  data, 
  keyCountries 
}: { 
  data: WordCloudData[], 
  keyCountries: Array<{code: string, name: string, color: string}>
}) {
  const [showNewToTop100, setShowNewToTop100] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState<number>(30);

  // Filter data based on selected region and show up to 60 ranks
  const getFilteredData = (): WordCloudData[] => {
    let filteredData = data;
    
    if (selectedRegion !== "all") {
      filteredData = data.filter(item => item.country === selectedRegion);
    }
    
    return filteredData.slice(0, Math.min(displayCount, 60));
  };

  const filteredData = getFilteredData();

  // Use filtered data and show proper ranking
  const rankingData = filteredData.map((hashtag, index) => ({
    rank: index + 1, // Always start from 1 for filtered results
    hashtag: `#${hashtag.text}`,
    posts: hashtag.publish_cnt ? `${(hashtag.publish_cnt / 1000).toFixed(1)}K` : "N/A",
    trend: hashtag.trend || "stable",
    trendValue: Math.floor(Math.random() * 10) + 1,
    creators: hashtag.creators?.slice(0, 3).map(creator => ({
      name: creator.nick_name,
      avatar: creator.avatar_url
    })) || [
      { name: "Creator", avatar: "/placeholder-user.jpg" }
    ],
    isNewToTop100: index >= 50,
    hashtagData: hashtag,
    region: hashtag.region,
    country: hashtag.country
  }));

  return (
    <div className="space-y-6">
      {/* Top navigation bar with categories */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center gap-6">
          {/* Category buttons */}
          <div className="flex items-center gap-2">
            <div className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              Hashtags
            </div>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              Songs
            </div>
            <div className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium">
              Creators
            </div>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
              TikTok Videos
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border flex-wrap">
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="all">All Regions</option>
          {keyCountries.map(country => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>

        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          value={displayCount}
          onChange={(e) => setDisplayCount(Number(e.target.value))}
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={30}>Top 30</option>
          <option value={40}>Top 40</option>
          <option value={50}>Top 50</option>
          <option value={60}>Top 60</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={showNewToTop100}
            onChange={(e) => setShowNewToTop100(e.target.checked)}
            className="rounded border-gray-300"
          />
          New to top {displayCount}
        </label>

        <div className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
          Showing ranks 1-{Math.min(filteredData.length, displayCount)} 
          {selectedRegion !== "all" ? ` for ${keyCountries.find(c => c.code === selectedRegion)?.name}` : " (All regions)"}
        </div>
      </div>

      {/* Main ranking table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Rank</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Hashtags</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Posts</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Trend</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Region</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Creators</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((item, index) => (
              <tr key={item.rank} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-gray-900">{item.rank}</div>
                    <div className="flex items-center gap-1">
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      )}
                      <span className={`text-sm font-medium ${
                        item.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.trendValue}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="font-semibold text-gray-900 text-lg">{item.hashtag}</div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{item.posts}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="w-20 h-10 relative">
                    {/* Mini trend chart */}
                    <svg width="80" height="40" className="absolute inset-0">
                      <path
                        d={item.trend === "up" 
                          ? "M0,35 Q20,30 40,20 Q60,10 80,5"
                          : "M0,5 Q20,15 40,25 Q60,30 80,35"
                        }
                        stroke={item.trend === "up" ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        fill="none"
                        className="drop-shadow-sm"
                      />
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={item.trend === "up" ? "#10b981" : "#ef4444"} stopOpacity="0.2"/>
                          <stop offset="100%" stopColor={item.trend === "up" ? "#10b981" : "#ef4444"} stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path
                        d={item.trend === "up" 
                          ? "M0,35 Q20,30 40,20 Q60,10 80,5 L80,40 L0,40 Z"
                          : "M0,5 Q20,15 40,25 Q60,30 80,35 L80,40 L0,40 Z"
                        }
                        fill={`url(#gradient-${index})`}
                      />
                    </svg>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="space-y-1">
                    {item.country && (
                      <div className="text-sm font-medium text-gray-700">
                        {keyCountries.find(c => c.code === item.country)?.name || item.country}
                      </div>
                    )}
                    {item.region && (
                      <div className="text-xs text-gray-500">
                        {item.region}
                      </div>
                    )}
                    {!item.country && !item.region && (
                      <div className="text-xs text-gray-400">Global</div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex -space-x-2">
                    {item.creators.slice(0, 3).map((creator, creatorIndex) => (
                      <div
                        key={creatorIndex}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AnalyticsWordCloud() {
  const [activeDataset, setActiveDataset] = useState<"comprehensive" | "apparel">("comprehensive");
  const [regionalData, setRegionalData] = useState<{
    generalData: WordCloudData[];
    fashionData: WordCloudData[];
    generalSummary: any;
    fashionSummary: any;
  }>({ generalData: [], fashionData: [], generalSummary: null, fashionSummary: null });
  const [loading, setLoading] = useState(true);

  // Key Asian countries for easy selection
  const keyCountries = [
    { code: 'MY', name: 'Malaysia', color: COUNTRY_COLORS['MY'] },
    { code: 'SG', name: 'Singapore', color: COUNTRY_COLORS['SG'] },
    { code: 'TH', name: 'Thailand', color: COUNTRY_COLORS['TH'] },
    { code: 'TW', name: 'Taiwan', color: COUNTRY_COLORS['TW'] },
    { code: 'KR', name: 'South Korea', color: COUNTRY_COLORS['KR'] },
    { code: 'ID', name: 'Indonesia', color: COUNTRY_COLORS['ID'] },
    { code: 'VN', name: 'Vietnam', color: COUNTRY_COLORS['VN'] },
    { code: 'JP', name: 'Japan', color: COUNTRY_COLORS['JP'] },
  ];

  // Load real data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await loadRegionalData();
        setRegionalData(data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get current data based on selected dataset
  const getCurrentData = (): WordCloudData[] => {
    if (activeDataset === "comprehensive") {
      return regionalData.generalData;
    } else {
      return regionalData.fashionData;
    }
  };

  const getCurrentSummary = () => {
    if (activeDataset === "comprehensive") {
      return regionalData.generalSummary;
    } else {
      return regionalData.fashionSummary;
    }
  };

  const currentData = getCurrentData();

  // Get region stats for display
  const getRegionStats = () => {
    const stats: Record<string, number> = {};
    regionalData.generalData.forEach(item => {
      if (item.region) {
        stats[item.region] = (stats[item.region] || 0) + 1;
      }
    });
    return stats;
  };

  const regionStats = getRegionStats();

  return (
    <div className="space-y-6">
      {/* Dataset Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dataset Selection
          </CardTitle>
          <CardDescription>
            Choose which dataset to analyze for hashtag trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={activeDataset === "comprehensive" ? "default" : "outline"}
              onClick={() => setActiveDataset("comprehensive")}
              className="flex items-center gap-2"
              size="lg"
            >
              <Globe className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Comprehensive Markets</div>
                <div className="text-xs opacity-80">
                  {regionalData.generalSummary?.total_hashtags_all_markets || 0} hashtags • 
                  {regionalData.generalSummary?.grand_total_unique_hashtags || 0} unique
                </div>
              </div>
            </Button>
            
            <Button
              variant={activeDataset === "apparel" ? "default" : "outline"}
              onClick={() => setActiveDataset("apparel")}
              className="flex items-center gap-2"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Apparel & Accessories</div>
                <div className="text-xs opacity-80">
                  {regionalData.fashionSummary?.total_hashtags_all_markets || 0} hashtags • 
                  {regionalData.fashionSummary?.grand_total_unique_hashtags || 0} unique
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* WordCloud Display Card */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Hashtag WordCloud
            </CardTitle>
            <CardDescription>
              {activeDataset === "comprehensive" 
                ? "Asian Markets - Hashtag WordCloud (All 480 Hashtags)" 
                : "Apparel & Accessories - WordCloud (All 453 Unique Hashtags)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactWordCloudComponent
              words={currentData}
              title={activeDataset === "comprehensive" 
                ? "Asian Markets - Hashtag WordCloud (All 480 Hashtags)" 
                : "Apparel & Accessories - WordCloud (All 453 Unique Hashtags)"
              }
              totalHashtags={getCurrentSummary()?.total_hashtags_all_markets || 0}
              uniqueHashtags={getCurrentSummary()?.grand_total_unique_hashtags || 0}
            />
          </CardContent>
        </Card>
      )}

      {/* Loading State Card */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading comprehensive hashtag data from Asian markets...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hashtag Ranking Table Card */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hashtag Rankings
            </CardTitle>
            <CardDescription>
              Top performing hashtags with detailed analytics and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HashtagRankingTable 
              data={currentData} 
              keyCountries={keyCountries}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
