"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  Clock,
  Sparkles,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface HistoryItem {
  type: 'image' | 'video';
  url: string;
  s3Key: string;
  s3Url: string;
  size: number;
  lastModified: string;
  timestamp: number;
  jobId?: string;
  metadata: {
    prompt: string;
    resolution: string;
    seed?: string;
    duration?: string;
    model: string;
  };
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const typeParam = activeTab === 'all' ? 'all' : activeTab === 'images' ? 'image' : 'video';
      const response = await fetch(`/api/history?type=${typeParam}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items || []);
      } else {
        throw new Error(data.error || 'Failed to load history');
      }
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadItem = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Generation History
            </h1>
          </div>
          <p className="text-gray-600">
            View and download all your AI-generated images and videos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Sparkles className="h-4 w-4" />
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Images ({items.filter(i => i.type === 'image').length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="gap-2">
                <Video className="h-4 w-4" />
                Videos ({items.filter(i => i.type === 'video').length})
              </TabsTrigger>
            </TabsList>

            <Button onClick={fetchHistory} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <TabsContent value={activeTab}>
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading history...</p>
                </div>
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800">Error: {error}</p>
                  <Button onClick={fetchHistory} className="mt-4">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && items.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  {activeTab === 'images' && <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />}
                  {activeTab === 'videos' && <Video className="h-16 w-16 text-gray-300 mb-4" />}
                  {activeTab === 'all' && <Sparkles className="h-16 w-16 text-gray-300 mb-4" />}
                  <p className="text-gray-500 text-center">
                    No {activeTab === 'all' ? 'generations' : activeTab} found.
                    <br />
                    Start creating to see your history here!
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square bg-gray-100">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.metadata.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-cover"
                          poster="/placeholder.jpg"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      
                      <Badge className="absolute top-2 right-2">
                        {item.type === 'image' ? (
                          <ImageIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <Video className="h-3 w-3 mr-1" />
                        )}
                        {item.type}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      {/* Prompt */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <strong>Prompt:</strong> {item.metadata.prompt}
                      </p>

                      {/* Metadata */}
                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.timestamp || item.lastModified)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3 w-3" />
                          {item.metadata.resolution}
                          {item.metadata.duration && ` · ${item.metadata.duration}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatSize(item.size)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => downloadItem(
                            item.url,
                            `${item.type}-${item.timestamp}.${item.type === 'image' ? 'png' : 'mp4'}`
                          )}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
