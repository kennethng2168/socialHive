"use client";

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { TrendPoint, WordCloudData } from '@/lib/data-parser';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Eye, Hash } from "lucide-react";

interface TrendingChartProps {
  isOpen: boolean;
  onClose: () => void;
  hashtag: WordCloudData | null;
}

export function TrendingChart({ isOpen, onClose, hashtag }: TrendingChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!isOpen || !hashtag || !chartRef.current) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare trend data
    const trendData = hashtag.trendData || [];
    const dates = trendData.map(point => new Date(point.time * 1000).toLocaleDateString());
    const values = trendData.map(point => (point.value * 100).toFixed(1));

    // Enhanced Chart configuration with multiple visualizations
    const option = {
      title: {
        text: `#${hashtag.text} Advanced Analytics`,
        subtext: `📊 ${values.length} data points • 🎯 Trend analysis with interactive data visualization`,
        left: 'center',
        textStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#1f2937'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#6b7280'
        }
      },
      legend: {
        data: ['Popularity Trend', 'Trend Points', ...(hashtag.video_views ? ['Video Views'] : [])],
        top: 60,
        left: 'center',
        textStyle: {
          color: '#374151',
          fontSize: 12
        },
        itemGap: 25,
        icon: 'circle'
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#374151'
        },
        formatter: function(params: any) {
          const point = params[0];
          const dataIndex = point.dataIndex;
          const totalDataPoints = values.length;
          const currentValue = parseFloat(point.value);
          
          // Calculate trend from previous point
          let trendFromPrevious = '➖ No change';
          if (dataIndex > 0) {
            const previousValue = parseFloat(values[dataIndex - 1]);
            const change = currentValue - previousValue;
            if (change > 0) {
              trendFromPrevious = `📈 +${change.toFixed(1)}% from previous`;
            } else if (change < 0) {
              trendFromPrevious = `📉 ${change.toFixed(1)}% from previous`;
            }
          }
          
          // Overall trend direction
          const trendDirection = values.length > 1 ? 
            (parseFloat(values[values.length - 1]) > parseFloat(values[0]) ? '📈 Rising' : '📉 Falling') : 
            '➖ Stable';
          
          // Performance tier
          let performanceTier = '';
          if (currentValue > 75) performanceTier = '🔥 Viral';
          else if (currentValue > 50) performanceTier = '🚀 Trending';
          else if (currentValue > 25) performanceTier = '📊 Moderate';
          else performanceTier = '📉 Low';
          
          return `
            <div style="padding: 14px; font-family: system-ui; min-width: 280px;">
              <div style="font-weight: bold; margin-bottom: 10px; color: #1f2937; font-size: 14px;">
                📍 Data Point ${dataIndex + 1} of ${totalDataPoints}
              </div>
              <div style="margin-bottom: 8px; font-size: 13px;">
                📅 <strong>Date:</strong> ${point.name}
              </div>
              <div style="margin-bottom: 8px; font-size: 13px;">
                <span style="color: #3b82f6; font-size: 16px;">●</span> <strong>Popularity:</strong> ${point.value}% ${performanceTier}
              </div>
              <div style="margin-bottom: 8px; font-size: 13px;">
                <span style="color: #10b981;">●</span> <strong>Total Views:</strong> ${formatNumber(hashtag.video_views || 0)}
              </div>
              <div style="margin-bottom: 8px; font-size: 13px;">
                <span style="color: #f59e0b;">●</span> <strong>Posts:</strong> ${formatNumber(hashtag.publish_cnt || 0)}
              </div>
              <div style="margin-bottom: 8px; padding: 6px; background: #f8fafc; border-radius: 6px; font-size: 12px;">
                <strong>Point-to-Point:</strong> ${trendFromPrevious}
              </div>
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px;">
                <div style="color: #6b7280;"><strong>Overall Trend:</strong> ${trendDirection}</div>
                <div style="color: #6b7280; margin-top: 2px;"><strong>Data Point:</strong> ${dataIndex + 1}/${totalDataPoints}</div>
              </div>
            </div>
          `;
        }
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '15%',
        top: '25%', // More space for title and legend
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11
        },
        axisLine: {
          lineStyle: {
            color: '#e5e7eb'
          }
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Popularity %',
          position: 'left',
          nameTextStyle: {
            color: '#6b7280',
            fontSize: 12
          },
          axisLabel: {
            color: '#6b7280',
            formatter: '{value}%'
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f3f4f6',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: 'Engagement',
          position: 'right',
          nameTextStyle: {
            color: '#6b7280',
            fontSize: 12
          },
          axisLabel: {
            color: '#6b7280',
            formatter: function(value: number) {
              return value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : 
                     value >= 1000 ? (value / 1000).toFixed(1) + 'K' : 
                     value.toString();
            }
          },
          axisLine: {
            lineStyle: {
              color: '#e5e7eb'
            }
          }
        }
      ],
      series: [
        {
          name: 'Popularity Trend',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'circle',
          symbolSize: 12, // Larger data points
          showSymbol: true, // Always show symbols/data points
          symbolBorder: 2,
          itemStyle: {
            color: '#3b82f6',
            borderColor: '#ffffff',
            borderWidth: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(59, 130, 246, 0.3)'
          },
          lineStyle: {
            width: 4,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' }
            ])
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(59, 130, 246, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(139, 92, 246, 0.1)'
              }
            ])
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#1d4ed8',
              borderColor: '#ffffff',
              borderWidth: 4,
              shadowBlur: 15,
              shadowColor: 'rgba(59, 130, 246, 0.6)',
              scale: 1.3 // Scale up on hover
            }
          },
          data: values.map((value, index) => ({
            value: value,
            itemStyle: {
              color: parseFloat(value) > 50 ? '#10b981' : parseFloat(value) > 25 ? '#f59e0b' : '#ef4444',
              borderColor: '#ffffff',
              borderWidth: 3
            }
          })),
          markPoint: {
            data: [
              { 
                type: 'max', 
                name: 'Peak', 
                itemStyle: { 
                  color: '#ef4444',
                  borderColor: '#ffffff',
                  borderWidth: 3
                },
                label: {
                  show: true,
                  position: 'top',
                  formatter: '🔥 Peak\n{c}%',
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: 12
                }
              },
              { 
                type: 'min', 
                name: 'Low', 
                itemStyle: { 
                  color: '#10b981',
                  borderColor: '#ffffff',
                  borderWidth: 3
                },
                label: {
                  show: true,
                  position: 'bottom',
                  formatter: '📉 Low\n{c}%',
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: 12
                }
              }
            ],
            symbolSize: 16
          },
          markLine: {
            data: [
              { 
                type: 'average', 
                name: 'Average', 
                lineStyle: { 
                  color: '#f59e0b', 
                  type: 'dashed',
                  width: 2
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '📊 Avg: {c}%',
                  color: '#f59e0b',
                  fontWeight: 'bold'
                }
              }
            ]
          }
        },
        // Add trend line with data points
        {
          name: 'Trend Points',
          type: 'scatter',
          yAxisIndex: 0,
          symbolSize: function(value: any, params: any) {
            // Dynamic size based on value
            const val = parseFloat(value);
            return val > 75 ? 20 : val > 50 ? 16 : val > 25 ? 12 : 8;
          },
          itemStyle: {
            color: function(params: any) {
              const val = parseFloat(params.value);
              if (val > 75) return '#ef4444'; // Red for viral
              if (val > 50) return '#f59e0b'; // Orange for trending  
              if (val > 25) return '#3b82f6'; // Blue for moderate
              return '#6b7280'; // Gray for low
            },
            borderColor: '#ffffff',
            borderWidth: 2,
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.3)'
          },
          emphasis: {
            itemStyle: {
              scale: 1.5,
              shadowBlur: 10
            }
          },
          data: values.map((value, index) => ({
            value: [index, value],
            symbolSize: parseFloat(value) > 75 ? 22 : parseFloat(value) > 50 ? 18 : parseFloat(value) > 25 ? 14 : 10
          })),
          label: {
            show: true,
            position: 'top',
            formatter: function(params: any) {
              const val = parseFloat(params.value[1]);
              if (val > 75) return '🔥';
              if (val > 50) return '🚀';
              if (val > 25) return '📊';
              return '';
            },
            fontSize: 14,
            distance: 8
          }
        },
        // Add engagement bars if we have the data
        ...(hashtag.video_views ? [{
          name: 'Video Views',
          type: 'bar',
          yAxisIndex: 1,
          data: dates.map((date, index) => {
            // Simulate varied engagement data based on trend
            const baseViews = hashtag.video_views || 0;
            const variation = (parseFloat(values[index]) / 100) * baseViews;
            return Math.floor(variation);
          }),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.8)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.3)' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(16, 185, 129, 0.5)'
            }
          }
        }] : [])
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, hashtag]);

  // Cleanup chart on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  if (!hashtag) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendDirection = () => {
    if (!hashtag.trendData || hashtag.trendData.length < 2) return null;
    
    const first = hashtag.trendData[0].value;
    const last = hashtag.trendData[hashtag.trendData.length - 1].value;
    
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'stable';
  };

  const trendDirection = getTrendDirection();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-blue-600" />
            #{hashtag.text} Analytics
          </DialogTitle>
          <DialogDescription>
            Detailed trending analysis and performance metrics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Rank</span>
                </div>
                <div className="text-2xl font-bold">#{hashtag.rank || 'N/A'}</div>
                <div className="text-xs text-gray-500">Current position</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Views</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(hashtag.video_views || 0)}</div>
                <div className="text-xs text-gray-500">Total video views</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Posts</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(hashtag.publish_cnt || 0)}</div>
                <div className="text-xs text-gray-500">Published content</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {trendDirection === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : trendDirection === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="text-sm font-medium">Trend</span>
                </div>
                <div className="text-lg font-bold">
                  {trendDirection === 'up' ? '↗ Rising' : 
                   trendDirection === 'down' ? '↘ Falling' : '→ Stable'}
                </div>
                <div className="text-xs text-gray-500">7-day direction</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Trend Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  📈 Popularity Trend Over Time
                </h3>
                <p className="text-sm text-gray-600">
                  Track how #{hashtag.text} has performed across the selected time period
                </p>
              </div>
              <div 
                ref={chartRef} 
                style={{ width: '100%', height: '450px' }}
              />
            </CardContent>
          </Card>

          {/* Performance Comparison Chart */}
          {hashtag.trendData && hashtag.trendData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 Performance Breakdown
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed metrics and engagement analysis
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Trend Direction */}
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl mb-2">
                      {trendDirection === 'up' ? '📈' : trendDirection === 'down' ? '📉' : '➖'}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {trendDirection === 'up' ? 'Rising Trend' : 
                       trendDirection === 'down' ? 'Declining Trend' : 'Stable Trend'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Based on 7-day data
                    </div>
                  </div>

                  {/* Peak Performance */}
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-gray-900">
                      {Math.max(...hashtag.trendData.map(p => p.value * 100)).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Peak popularity
                    </div>
                  </div>

                  {/* Volatility */}
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-semibold text-gray-900">
                      {(Math.max(...hashtag.trendData.map(p => p.value)) - 
                        Math.min(...hashtag.trendData.map(p => p.value)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Volatility range
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creator Information */}
          {hashtag.creators && hashtag.creators.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Creators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hashtag.creators.slice(0, 6).map((creator, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={creator.avatar_url}
                        alt={creator.nick_name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-user.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {creator.nick_name}
                        </div>
                        <div className="text-xs text-gray-500">Creator #{index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <div className="flex flex-wrap gap-2">
            {hashtag.country && (
              <Badge variant="outline">
                Country: {hashtag.country}
              </Badge>
            )}
            {hashtag.region && (
              <Badge variant="outline">
                Region: {hashtag.region}
              </Badge>
            )}
            {hashtag.hashtag_id && (
              <Badge variant="secondary">
                ID: {hashtag.hashtag_id}
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
