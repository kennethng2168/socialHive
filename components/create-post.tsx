"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Facebook,
  Instagram,
  Calendar,
  Image,
  Video,
  Hash,
  MapPin,
  Users,
  Clock,
  Globe,
  Lock,
  UserCheck,
  Upload,
  X,
  Heart,
  MessageCircle,
  Share,
  Tag,
  Camera,
  Music,
  AtSign,
  Zap,
  CheckCircle,
  Loader2,
} from "lucide-react";

const platforms = [
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    maxChars: 63206,
    features: ["text", "image", "video", "location", "audience", "schedule"],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 to-pink-500",
    maxChars: 2200,
    features: ["text", "image", "video", "hashtags", "location", "schedule"],
  },
  {
    id: "x",
    name: "X (Twitter)",
    icon: X,
    color: "bg-black",
    maxChars: 280,
    features: ["text", "image", "video", "hashtags", "mentions", "schedule"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Camera,
    color: "bg-black",
    maxChars: 2200,
    features: ["text", "video", "hashtags", "music", "effects", "schedule"],
  },
];

const audienceOptions = [
  { value: "public", label: "Public", icon: Globe },
  { value: "friends", label: "Friends", icon: Users },
  { value: "specific", label: "Specific Friends", icon: UserCheck },
  { value: "only_me", label: "Only Me", icon: Lock },
];

const hashtagSuggestions = [
  "#socialmedia", "#content", "#viral", "#trending", "#marketing",
  "#digital", "#creative", "#lifestyle", "#brand", "#engagement"
];

export function CreatePost() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("public");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const addHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag]);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getCharCount = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.maxChars - postContent.length : 0;
  };

  const isCharLimitExceeded = (platformId: string) => {
    return getCharCount(platformId) < 0;
  };

  const validatePost = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to publish to.",
        variant: "destructive",
      });
      return false;
    }

    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return false;
    }

    // Check character limits for selected platforms
    for (const platformId of selectedPlatforms) {
      if (isCharLimitExceeded(platformId)) {
        const platform = platforms.find(p => p.id === platformId);
        toast({
          title: "Content too long",
          description: `Your post exceeds the character limit for ${platform?.name}. Please shorten your content.`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handlePublish = async () => {
    if (!validatePost()) return;

    setIsPublishing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success toast
      toast({
        title: "Post published successfully!",
        description: `Your post has been published to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}.`,
        duration: 5000,
      });

      // Reset form or redirect
      setTimeout(() => {
        router.push('/posts');
      }, 1500);

    } catch (error) {
      toast({
        title: "Failed to publish",
        description: "There was an error publishing your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!validatePost()) return;

    if (!scheduledDate) {
      toast({
        title: "Schedule date required",
        description: "Please select a date and time for scheduling.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Post scheduled successfully!",
        description: `Your post has been scheduled for ${new Date(scheduledDate).toLocaleString()}.`,
        duration: 5000,
      });

      setTimeout(() => {
        router.push('/posts');
      }, 1500);

    } catch (error) {
      toast({
        title: "Failed to schedule",
        description: "There was an error scheduling your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!postContent.trim()) {
      toast({
        title: "No content to save",
        description: "Please add some content before saving as draft.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Draft saved!",
        description: "Your post has been saved as a draft.",
      });

    } catch (error) {
      toast({
        title: "Failed to save draft",
        description: "There was an error saving your draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600 mt-2">Share your content across multiple social platforms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isPublishing}>
            Save Draft
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90" 
            onClick={isScheduled ? handleSchedule : handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isScheduled ? "Scheduling..." : "Publishing..."}
              </>
            ) : isScheduled ? (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Publish Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Select Platforms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{platform.name}</span>
                        {isSelected && isCharLimitExceeded(platform.id) && (
                          <Badge variant="destructive" className="text-xs">
                            Over limit
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                
                {/* Character Count for Selected Platforms */}
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    const remaining = getCharCount(platformId);
                    const isOver = remaining < 0;
                    
                    return (
                      <Badge
                        key={platformId}
                        variant={isOver ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {platform?.name}: {remaining} chars
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("media-upload")?.click()}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Add Images
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("media-upload")?.click()}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Add Videos
                  </Button>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          {file.type.startsWith("image/") ? (
                            <Image className="h-8 w-8 text-gray-400" />
                          ) : (
                            <Video className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {tag}
                      <button
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {hashtagSuggestions
                    .filter(tag => !hashtags.includes(tag))
                    .slice(0, 5)
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addHashtag(tag)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform-Specific Features */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={selectedPlatforms[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {platforms
                    .filter(p => selectedPlatforms.includes(p.id))
                    .map(platform => {
                      const Icon = platform.icon;
                      return (
                        <TabsTrigger key={platform.id} value={platform.id}>
                          <Icon className="h-4 w-4 mr-2" />
                          {platform.name}
                        </TabsTrigger>
                      );
                    })}
                </TabsList>

                {selectedPlatforms.map(platformId => (
                  <TabsContent key={platformId} value={platformId} className="space-y-4">
                    {/* Facebook Features */}
                    {platformId === "facebook" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Audience
                          </Label>
                          <Select value={audience} onValueChange={setAudience}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {audienceOptions.map(option => {
                                const Icon = option.icon;
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location (Optional)
                          </Label>
                          <Input
                            placeholder="Add location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Instagram Features */}
                    {platformId === "instagram" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Tag People
                          </Label>
                          <Input placeholder="@username" />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </Label>
                          <Input
                            placeholder="Add location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="hide-likes" />
                          <Label htmlFor="hide-likes">Hide like and view counts</Label>
                        </div>
                      </div>
                    )}

                    {/* X (Twitter) Features */}
                    {platformId === "x" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <AtSign className="h-4 w-4" />
                            Mentions
                          </Label>
                          <Input placeholder="@username" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="restrict-replies" />
                          <Label htmlFor="restrict-replies">Restrict who can reply</Label>
                        </div>
                      </div>
                    )}

                    {/* TikTok Features */}
                    {platformId === "tiktok" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Add Music
                          </Label>
                          <Button variant="outline" className="w-full">
                            Browse Music Library
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Effects & Filters</Label>
                          <Button variant="outline" className="w-full">
                            Add Effects
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="allow-comments" defaultChecked />
                          <Label htmlFor="allow-comments">Allow comments</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="allow-duet" defaultChecked />
                          <Label htmlFor="allow-duet">Allow Duet</Label>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule-post"
                  checked={isScheduled}
                  onCheckedChange={setIsScheduled}
                />
                <Label htmlFor="schedule-post">Schedule for later</Label>
              </div>
              
              {isScheduled && (
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPlatforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  const Icon = platform?.icon || X;
                  
                  return (
                    <div key={platformId} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{platform?.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-3">
                        {postContent || "Your content will appear here..."}
                      </div>
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hashtags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-blue-600">
                              {tag}
                            </span>
                          ))}
                          {hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Prediction */}
          <Card>
            <CardHeader>
              <CardTitle>Predicted Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    Engagement
                  </span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <Share className="h-4 w-4 text-blue-500" />
                    Reach
                  </span>
                  <span className="text-sm font-medium">2.3K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Comments
                  </span>
                  <span className="text-sm font-medium">45</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
