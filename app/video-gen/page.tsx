"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video,
  Play,
  Download,
  Upload,
  Loader2,
  Sparkles,
  Film,
  Settings,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Camera,
  Image as ImageIcon
} from "lucide-react";

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: "Ultra Fast" | "Fast" | "Standard" | "Pro";
  resolution: string[];
  duration: string[];
  features: string[];
  category: "text-to-video" | "image-to-video" | "video-editing" | "lipsync";
}

interface GenerationResult {
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  error?: string;
  metadata?: {
    model: string;
    prompt: string;
    resolution: string;
    duration: string;
    seed?: number;
  };
}

const videoModels: VideoModel[] = [
  // Google Models
  {
    id: "google-veo3",
    name: "Google Veo3",
    provider: "Google",
    description: "Latest Google video generation model with exceptional quality",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s", "20s"],
    features: ["High Quality", "Photorealistic", "Latest Version"],
    category: "text-to-video"
  },
  {
    id: "google-veo3-fast",
    name: "Google Veo3 Fast",
    provider: "Google",
    description: "Fast version of Veo3 for quick video generation",
    speed: "Fast",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Fast Generation", "Good Quality"],
    category: "text-to-video"
  },
  {
    id: "google-veo3-image-to-video",
    name: "Google Veo3 Image to Video",
    provider: "Google",
    description: "Convert static images to videos with Veo3",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Image to Video", "High Quality"],
    category: "image-to-video"
  },
  {
    id: "google-veo3-fast-image-to-video",
    name: "Google Veo3 Fast I2V",
    provider: "Google",
    description: "Fast image to video conversion",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s"],
    features: ["Fast I2V", "Quick Results"],
    category: "image-to-video"
  },
  {
    id: "google-veo2",
    name: "Google Veo2",
    provider: "Google",
    description: "Previous generation Google video model",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Reliable", "Proven Quality"],
    category: "text-to-video"
  },
  {
    id: "google-veo2-image-to-video",
    name: "Google Veo2 Image to Video",
    provider: "Google",
    description: "Image to video with Veo2",
    speed: "Standard",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Image to Video", "Reliable"],
    category: "image-to-video"
  },

  // ByteDance Models
  {
    id: "bytedance-dreamina-v3.0-text-to-video-1080p",
    name: "ByteDance Dreamina V3.0 T2V 1080p",
    provider: "ByteDance",
    description: "High resolution text to video generation",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["1080p", "High Quality", "Advanced AI"],
    category: "text-to-video"
  },
  {
    id: "bytedance-dreamina-v3.0-text-to-video-720p",
    name: "ByteDance Dreamina V3.0 T2V 720p",
    provider: "ByteDance",
    description: "Standard resolution text to video",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s", "15s"],
    features: ["720p", "Fast Generation"],
    category: "text-to-video"
  },
  {
    id: "bytedance-dreamina-v3.0-image-to-video-1080p",
    name: "ByteDance Dreamina V3.0 I2V 1080p",
    provider: "ByteDance",
    description: "High quality image to video conversion",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s"],
    features: ["1080p", "I2V", "High Quality"],
    category: "image-to-video"
  },
  {
    id: "bytedance-dreamina-v3.0-image-to-video-720p",
    name: "ByteDance Dreamina V3.0 I2V 720p",
    provider: "ByteDance",
    description: "Fast image to video conversion",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["720p", "Fast I2V"],
    category: "image-to-video"
  },
  {
    id: "bytedance-dreamina-v3.0-pro-text-to-video",
    name: "ByteDance Dreamina V3.0 Pro T2V",
    provider: "ByteDance",
    description: "Professional grade text to video",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["10s", "20s", "30s"],
    features: ["Pro Quality", "Extended Duration", "Professional"],
    category: "text-to-video"
  },
  {
    id: "bytedance-dreamina-v3.0-pro-image-to-video",
    name: "ByteDance Dreamina V3.0 Pro I2V",
    provider: "ByteDance",
    description: "Professional image to video conversion",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["10s", "20s"],
    features: ["Pro Quality", "High Resolution", "Professional"],
    category: "image-to-video"
  },
  {
    id: "bytedance-seedance-v1-lite-t2v-1080p",
    name: "ByteDance Seedance V1 Lite T2V 1080p",
    provider: "ByteDance",
    description: "Lite version for fast high-res generation",
    speed: "Fast",
    resolution: ["1920x1080"],
    duration: ["5s", "10s"],
    features: ["Lite Version", "1080p", "Fast"],
    category: "text-to-video"
  },
  {
    id: "bytedance-seedance-v1-lite-t2v-720p",
    name: "ByteDance Seedance V1 Lite T2V 720p",
    provider: "ByteDance",
    description: "Lite version for fast standard generation",
    speed: "Ultra Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Lite", "720p", "Ultra Fast"],
    category: "text-to-video"
  },
  {
    id: "bytedance-seedance-v1-lite-t2v-480p",
    name: "ByteDance Seedance V1 Lite T2V 480p",
    provider: "ByteDance",
    description: "Ultra fast low resolution generation",
    speed: "Ultra Fast",
    resolution: ["854x480"],
    duration: ["5s", "10s"],
    features: ["480p", "Ultra Fast", "Quick Preview"],
    category: "text-to-video"
  },
  {
    id: "bytedance-seedance-v1-pro-t2v-1080p",
    name: "ByteDance Seedance V1 Pro T2V 1080p",
    provider: "ByteDance",
    description: "Professional text to video generation",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s", "30s"],
    features: ["Pro Quality", "1080p", "Extended Duration"],
    category: "text-to-video"
  },
  {
    id: "bytedance-lipsync-audio-to-video",
    name: "ByteDance Lipsync Audio to Video",
    provider: "ByteDance",
    description: "Sync video with audio for realistic lipsync",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["Variable"],
    features: ["Lipsync", "Audio Sync", "Realistic"],
    category: "lipsync"
  },

  // Kwaivgi (Kling) Models
  {
    id: "kwaivgi-kling-v2.1-t2v-master",
    name: "Kling V2.1 T2V Master",
    provider: "Kwaivgi",
    description: "Master version of Kling with superior quality",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["10s", "20s", "30s"],
    features: ["Master Quality", "Superior", "Latest Version"],
    category: "text-to-video"
  },
  {
    id: "kwaivgi-kling-v2.1-i2v-master",
    name: "Kling V2.1 I2V Master",
    provider: "Kwaivgi",
    description: "Master image to video conversion",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["10s", "20s"],
    features: ["Master Quality", "I2V", "Superior"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-v2.1-i2v-pro",
    name: "Kling V2.1 I2V Pro",
    provider: "Kwaivgi",
    description: "Professional image to video conversion",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["Pro Quality", "I2V", "Flexible Duration"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-v2.1-i2v-standard",
    name: "Kling V2.1 I2V Standard",
    provider: "Kwaivgi",
    description: "Standard image to video conversion",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Standard Quality", "Fast", "I2V"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-v2.0-t2v-master",
    name: "Kling V2.0 T2V Master",
    provider: "Kwaivgi",
    description: "Previous master version with proven quality",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s"],
    features: ["Master", "Proven Quality", "V2.0"],
    category: "text-to-video"
  },
  {
    id: "kwaivgi-kling-v2.0-i2v-master",
    name: "Kling V2.0 I2V Master",
    provider: "Kwaivgi",
    description: "V2.0 master image to video",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s"],
    features: ["Master", "I2V", "V2.0"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-v1.6-t2v-standard",
    name: "Kling V1.6 T2V Standard",
    provider: "Kwaivgi",
    description: "Reliable standard text to video",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Standard", "Reliable", "Fast"],
    category: "text-to-video"
  },
  {
    id: "kwaivgi-kling-v1.6-i2v-pro",
    name: "Kling V1.6 I2V Pro",
    provider: "Kwaivgi",
    description: "Professional V1.6 image to video",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["Pro", "V1.6", "I2V"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-v1.6-i2v-standard",
    name: "Kling V1.6 I2V Standard",
    provider: "Kwaivgi",
    description: "Standard V1.6 image to video",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Standard", "Fast", "I2V"],
    category: "image-to-video"
  },
  {
    id: "kwaivgi-kling-lipsync-audio-to-video",
    name: "Kling Lipsync Audio to Video",
    provider: "Kwaivgi",
    description: "Advanced lipsync with audio synchronization",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["Variable"],
    features: ["Lipsync", "Audio Sync", "Advanced"],
    category: "lipsync"
  },
  {
    id: "kwaivgi-kling-lipsync-text-to-video",
    name: "Kling Lipsync Text to Video",
    provider: "Kwaivgi",
    description: "Generate lipsync videos from text",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["Variable"],
    features: ["Text Lipsync", "Speaking Video", "Advanced"],
    category: "lipsync"
  },

  // Minimax Models
  {
    id: "minimax-hailuo-02-pro",
    name: "Minimax Hailuo 02 Pro",
    provider: "Minimax",
    description: "Professional grade video generation",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s", "30s"],
    features: ["Pro Quality", "Extended Duration", "Advanced"],
    category: "text-to-video"
  },
  {
    id: "minimax-hailuo-02-standard",
    name: "Minimax Hailuo 02 Standard",
    provider: "Minimax",
    description: "Standard quality video generation",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s", "15s"],
    features: ["Standard Quality", "Fast", "Reliable"],
    category: "text-to-video"
  },
  {
    id: "minimax-hailuo-02-fast",
    name: "Minimax Hailuo 02 Fast",
    provider: "Minimax",
    description: "Fast video generation for quick results",
    speed: "Ultra Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Ultra Fast", "Quick Results", "Good Quality"],
    category: "text-to-video"
  },
  {
    id: "minimax-hailuo-02-t2v-pro",
    name: "Minimax Hailuo 02 T2V Pro",
    provider: "Minimax",
    description: "Professional text to video generation",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s"],
    features: ["T2V Pro", "Professional", "High Quality"],
    category: "text-to-video"
  },
  {
    id: "minimax-hailuo-02-i2v-pro",
    name: "Minimax Hailuo 02 I2V Pro",
    provider: "Minimax",
    description: "Professional image to video conversion",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["I2V Pro", "Professional", "High Quality"],
    category: "image-to-video"
  },
  {
    id: "minimax-video-02",
    name: "Minimax Video 02",
    provider: "Minimax",
    description: "Latest Minimax video generation model",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s", "20s"],
    features: ["Latest Version", "Improved Quality", "Flexible"],
    category: "text-to-video"
  },
  {
    id: "minimax-video-01",
    name: "Minimax Video 01",
    provider: "Minimax",
    description: "Previous generation with proven reliability",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Proven", "Reliable", "Fast"],
    category: "text-to-video"
  },

  // Pika Models
  {
    id: "pika-v2.2-t2v",
    name: "Pika V2.2 T2V",
    provider: "Pika",
    description: "Latest Pika text to video model",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["3s", "5s", "10s"],
    features: ["Latest Version", "Creative", "High Quality"],
    category: "text-to-video"
  },
  {
    id: "pika-v2.2-i2v",
    name: "Pika V2.2 I2V",
    provider: "Pika",
    description: "Latest Pika image to video model",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["3s", "5s", "10s"],
    features: ["Latest Version", "I2V", "Creative"],
    category: "image-to-video"
  },
  {
    id: "pika-v2.1-t2v",
    name: "Pika V2.1 T2V",
    provider: "Pika",
    description: "Previous Pika text to video model",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["3s", "5s"],
    features: ["V2.1", "Fast", "Creative"],
    category: "text-to-video"
  },
  {
    id: "pika-v2.1-i2v",
    name: "Pika V2.1 I2V",
    provider: "Pika",
    description: "Previous Pika image to video model",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["3s", "5s"],
    features: ["V2.1", "I2V", "Fast"],
    category: "image-to-video"
  },
  {
    id: "pika-v2.0-turbo-t2v",
    name: "Pika V2.0 Turbo T2V",
    provider: "Pika",
    description: "Turbo version for ultra fast generation",
    speed: "Ultra Fast",
    resolution: ["1280x720"],
    duration: ["3s", "5s"],
    features: ["Turbo", "Ultra Fast", "Quick Results"],
    category: "text-to-video"
  },
  {
    id: "pika-v2.0-turbo-i2v",
    name: "Pika V2.0 Turbo I2V",
    provider: "Pika",
    description: "Turbo image to video conversion",
    speed: "Ultra Fast",
    resolution: ["1280x720"],
    duration: ["3s", "5s"],
    features: ["Turbo", "I2V", "Ultra Fast"],
    category: "image-to-video"
  },

  // RunwayML Models
  {
    id: "runwayml-gen4-aleph",
    name: "RunwayML Gen4 Aleph",
    provider: "RunwayML",
    description: "Latest Gen4 model with Aleph architecture",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["10s", "20s", "30s"],
    features: ["Gen4", "Aleph", "Professional", "Extended Duration"],
    category: "text-to-video"
  },
  {
    id: "runwayml-gen4-image",
    name: "RunwayML Gen4 Image",
    provider: "RunwayML",
    description: "Gen4 model optimized for image to video",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["Gen4", "I2V Optimized", "High Quality"],
    category: "image-to-video"
  },
  {
    id: "runwayml-gen4-image-turbo",
    name: "RunwayML Gen4 Image Turbo",
    provider: "RunwayML",
    description: "Turbo version for fast image to video",
    speed: "Fast",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Gen4", "Turbo", "Fast I2V"],
    category: "image-to-video"
  },
  {
    id: "runwayml-gen4-turbo",
    name: "RunwayML Gen4 Turbo",
    provider: "RunwayML",
    description: "Turbo version for fast text to video",
    speed: "Fast",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Gen4", "Turbo", "Fast T2V"],
    category: "text-to-video"
  },

  // WaveSpeed AI Models
  {
    id: "wan-2.2-t2v-plus-1080p",
    name: "WAN 2.2 T2V Plus 1080p",
    provider: "WaveSpeed AI",
    description: "Latest WAN model with enhanced quality",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "20s"],
    features: ["Latest WAN", "Plus Version", "1080p"],
    category: "text-to-video"
  },
  {
    id: "wan-2.2-i2v-plus-1080p",
    name: "WAN 2.2 I2V Plus 1080p",
    provider: "WaveSpeed AI",
    description: "Enhanced image to video conversion",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["Latest WAN", "I2V Plus", "1080p"],
    category: "image-to-video"
  },
  {
    id: "wan-2.1-t2v-720p",
    name: "WAN 2.1 T2V 720p",
    provider: "WaveSpeed AI",
    description: "Standard resolution text to video",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s", "15s"],
    features: ["WAN 2.1", "720p", "Fast"],
    category: "text-to-video"
  },
  {
    id: "wan-2.1-i2v-720p",
    name: "WAN 2.1 I2V 720p",
    provider: "WaveSpeed AI",
    description: "Standard image to video conversion",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["WAN 2.1", "I2V", "720p"],
    category: "image-to-video"
  },
  {
    id: "wan-2.1-t2v-480p-ultra-fast",
    name: "WAN 2.1 T2V 480p Ultra Fast",
    provider: "WaveSpeed AI",
    description: "Ultra fast low resolution generation",
    speed: "Ultra Fast",
    resolution: ["854x480"],
    duration: ["5s", "10s"],
    features: ["Ultra Fast", "480p", "Quick Preview"],
    category: "text-to-video"
  },
  {
    id: "wan-2.1-i2v-480p-ultra-fast",
    name: "WAN 2.1 I2V 480p Ultra Fast",
    provider: "WaveSpeed AI",
    description: "Ultra fast image to video preview",
    speed: "Ultra Fast",
    resolution: ["854x480"],
    duration: ["5s"],
    features: ["Ultra Fast", "I2V", "480p"],
    category: "image-to-video"
  },
  {
    id: "ltx-video-v097-i2v-720p",
    name: "LTX Video V0.97 I2V 720p",
    provider: "WaveSpeed AI",
    description: "LTX model for image to video conversion",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["LTX", "I2V", "720p"],
    category: "image-to-video"
  },
  {
    id: "ltx-video-v097-i2v-480p",
    name: "LTX Video V0.97 I2V 480p",
    provider: "WaveSpeed AI",
    description: "Fast LTX image to video",
    speed: "Ultra Fast",
    resolution: ["854x480"],
    duration: ["5s"],
    features: ["LTX", "Ultra Fast", "480p"],
    category: "image-to-video"
  },
  {
    id: "skyreels-v1",
    name: "SkyReels V1",
    provider: "WaveSpeed AI",
    description: "Specialized model for cinematic videos",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["10s", "20s"],
    features: ["Cinematic", "High Quality", "Professional"],
    category: "text-to-video"
  },
  {
    id: "hunyuan-video-t2v",
    name: "Hunyuan Video T2V",
    provider: "WaveSpeed AI",
    description: "Chinese AI model for text to video",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s", "15s"],
    features: ["Chinese AI", "T2V", "Advanced"],
    category: "text-to-video"
  },
  {
    id: "hunyuan-video-i2v",
    name: "Hunyuan Video I2V",
    provider: "WaveSpeed AI",
    description: "Chinese AI model for image to video",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s"],
    features: ["Chinese AI", "I2V", "Advanced"],
    category: "image-to-video"
  },

  // OpenAI Models
  {
    id: "openai-sora",
    name: "OpenAI Sora",
    provider: "OpenAI",
    description: "OpenAI's advanced video generation model",
    speed: "Pro",
    resolution: ["1920x1080", "1080x1920", "1024x1024"],
    duration: ["10s", "20s", "60s"],
    features: ["OpenAI", "Advanced", "Long Duration", "Multiple Ratios"],
    category: "text-to-video"
  }
];

export default function VideoGenerationPage() {
  const [selectedModel, setSelectedModel] = useState<VideoModel>(videoModels[0]);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("1280x720");
  const [duration, setDuration] = useState("10s");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "text-to-video", name: "Text to Video" },
    { id: "image-to-video", name: "Image to Video" },
    { id: "video-editing", name: "Video Editing" },
    { id: "lipsync", name: "Lipsync" }
  ];

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" },
    { id: "ByteDance", name: "ByteDance" },
    { id: "Kwaivgi", name: "Kwaivgi (Kling)" },
    { id: "Minimax", name: "Minimax" },
    { id: "Pika", name: "Pika" },
    { id: "RunwayML", name: "RunwayML" },
    { id: "WaveSpeed AI", name: "WaveSpeed AI" },
    { id: "OpenAI", name: "OpenAI" }
  ];

  const filteredModels = videoModels.filter(model => {
    const categoryMatch = selectedCategory === "all" || model.category === selectedCategory;
    const providerMatch = selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const handleGenerate = async () => {
    if (!prompt.trim() && selectedModel.category === "text-to-video") {
      setResult({
        success: false,
        error: "Please enter a prompt for text-to-video generation"
      });
      return;
    }

    if (!imageFile && selectedModel.category === "image-to-video") {
      setResult({
        success: false,
        error: "Please upload an image for image-to-video generation"
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      // Simulate API call to WaveSpeedAI
      const formData = new FormData();
      formData.append('model', selectedModel.id);
      formData.append('prompt', prompt);
      formData.append('negative_prompt', negativePrompt);
      formData.append('resolution', resolution);
      formData.append('duration', duration);
      if (seed) formData.append('seed', seed.toString());
      if (imageFile) formData.append('image', imageFile);

      const response = await fetch('/api/wavespeed-video', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Video generation error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: selectedModel.name,
          prompt,
          resolution,
          duration,
          seed
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!result?.videoUrl) return;

    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = `${selectedModel.name.replace(/\s+/g, '-')}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "Ultra Fast": return "bg-green-100 text-green-800";
      case "Fast": return "bg-blue-100 text-blue-800";
      case "Standard": return "bg-yellow-100 text-yellow-800";
      case "Pro": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Film className="h-10 w-10 text-purple-600" />
                AI Video Generation Studio
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Create stunning videos with state-of-the-art AI models from Google, ByteDance, Kling, Minimax, and more. 
                Generate videos in under 2 minutes with our ultra-fast models.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Model Selection */}
              <div className="xl:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Model & Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map(provider => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <Label>AI Model ({filteredModels.length} available)</Label>
                      <ScrollArea className="h-64 border rounded-md p-2">
                        <div className="space-y-2">
                          {filteredModels.map(model => (
                            <div
                              key={model.id}
                              onClick={() => setSelectedModel(model)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedModel.id === model.id 
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm">{model.name}</h4>
                                <Badge className={getSpeedColor(model.speed)}>
                                  {model.speed}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {model.features.slice(0, 2).map(feature => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected Model Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{selectedModel.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{selectedModel.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSpeedColor(selectedModel.speed)}>
                          {selectedModel.speed}
                        </Badge>
                        <Badge variant="outline">{selectedModel.provider}</Badge>
                        <Badge variant="secondary">{selectedModel.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Generation Settings */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Resolution</Label>
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedModel.resolution.map(res => (
                              <SelectItem key={res} value={res}>
                                {res}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedModel.duration.map(dur => (
                              <SelectItem key={dur} value={dur}>
                                {dur}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Seed (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Random if empty"
                          value={seed || ""}
                          onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Generation Interface */}
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="h-5 w-5" />
                      Video Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Upload for I2V */}
                    {selectedModel.category === "image-to-video" && (
                      <div className="space-y-2">
                        <Label>Source Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              onClick={() => document.getElementById('image-upload')?.click()}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Choose Image
                            </Button>
                            <p className="text-sm text-gray-500">
                              {imageFile ? imageFile.name : "PNG, JPG up to 10MB"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>
                        {selectedModel.category === "image-to-video" ? "Motion Prompt (Optional)" : "Video Prompt"}
                      </Label>
                      <Textarea
                        placeholder={
                          selectedModel.category === "image-to-video" 
                            ? "Describe the motion or animation you want..."
                            : "Describe the video you want to generate..."
                        }
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Negative Prompt (Optional)</Label>
                      <Textarea
                        placeholder="What to avoid in the video..."
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || 
                        (selectedModel.category === "text-to-video" && !prompt.trim()) ||
                        (selectedModel.category === "image-to-video" && !imageFile)
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Video...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Generated Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating && (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                          <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                            <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Generating with {selectedModel.name}</h3>
                            <p className="text-purple-600 font-medium">
                              {selectedModel.speed === "Ultra Fast" ? "⚡ Ultra Fast - Under 30 seconds" :
                               selectedModel.speed === "Fast" ? "🚀 Fast - Under 1 minute" :
                               selectedModel.speed === "Standard" ? "⏱️ Standard - Under 2 minutes" :
                               "🎯 Pro - High Quality Processing"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Video generation typically takes longer than images. Please wait...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result?.success && result.videoUrl && (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            src={result.videoUrl}
                            controls
                            className="w-full rounded-lg shadow-lg"
                            poster="/placeholder.jpg"
                          >
                            Your browser does not support the video tag.
                          </video>
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        </div>
                        
                        {result.metadata && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Generation Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Model: {result.metadata.model}</div>
                              <div>Resolution: {result.metadata.resolution}</div>
                              <div>Duration: {result.metadata.duration}</div>
                              {result.metadata.seed && <div>Seed: {result.metadata.seed}</div>}
                              <div className="col-span-2">Prompt: {result.metadata.prompt}</div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={downloadVideo}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Video
                        </Button>
                      </div>
                    )}

                    {result?.error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Error:</strong> {result.error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {!isGenerating && !result && (
                      <div className="flex items-center justify-center h-64 text-center">
                        <div>
                          <Film className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            {selectedModel.category === "image-to-video" 
                              ? "Upload an image and click 'Generate Video' to create your AI video!"
                              : "Enter a prompt and click 'Generate Video' to create your AI masterpiece!"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
