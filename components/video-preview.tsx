"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from "lucide-react";

interface VideoPreviewProps {
  file: File | null;
}

export function VideoPreview({ file }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    console.log("Toggle play clicked");

    if (videoRef.current) {
      console.log("Video paused state:", videoRef.current.paused);
      console.log("Current time:", videoRef.current.currentTime);
      console.log("Duration:", videoRef.current.duration);

      if (videoRef.current.paused) {
        console.log("Playing video...");
        // Ensure video is ready and not loading
        if (videoRef.current.readyState >= 2) {
          videoRef.current
            .play()
            .then(() => {
              console.log("Play successful - video should be playing now");
              console.log("Video paused after play:", videoRef.current?.paused);
            })
            .catch((err) => {
              console.error("Play failed:", err);
              // If play fails due to load interruption, try again after a short delay
              if (err.name === "AbortError") {
                console.log("Retrying play after load interruption...");
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch((retryErr) => {
                      console.error("Retry play failed:", retryErr);
                    });
                  }
                }, 100);
              }
            });
        } else {
          console.log("Video not ready, waiting for canplay...");
          const handleCanPlay = () => {
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
            videoRef.current
              ?.play()
              .catch((err) => console.error("Play after canplay failed:", err));
          };
          videoRef.current.addEventListener("canplay", handleCanPlay);
        }
      } else {
        console.log("Pausing video...");
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const paused = videoRef.current.paused;
      setCurrentTime(currentTime);

      // Log progress every 0.5 seconds for debugging
      if (Math.floor(currentTime * 2) % 1 === 0 && currentTime > 0) {
        console.log(
          `⏱️ Video progress: ${currentTime.toFixed(1)}s / ${duration.toFixed(
            1
          )}s, paused: ${paused}`
        );
      }

      // Log if video stops unexpectedly
      if (paused && currentTime < duration - 0.5 && currentTime > 0.5) {
        console.log("⚠️ Video paused unexpectedly at:", currentTime, "seconds");
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      console.log("Video metadata loaded - Duration:", duration, "seconds");
      console.log(
        "Video duration in minutes:",
        Math.floor(duration / 60),
        ":",
        Math.floor(duration % 60)
      );
      setDuration(duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Add event listeners for video state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      console.log("🎬 Video play event - setting isPlaying to true");
      console.log("Current time when playing:", videoRef.current?.currentTime);
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log("⏸️ Video pause event - setting isPlaying to false");
      console.log("Current time when paused:", videoRef.current?.currentTime);
      console.log("Duration:", videoRef.current?.duration);
      console.log("Stack trace:", new Error().stack);
      setIsPlaying(false);
    };
    const handleEnded = () => {
      console.log("🏁 Video ended event - setting isPlaying to false");
      console.log("Video reached end at time:", videoRef.current?.currentTime);
      setIsPlaying(false);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [file]);

  if (!file) {
    return (
      <div className="aspect-[9/16] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No video selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={URL.createObjectURL(file)}
          className="w-full h-full object-cover"
          muted
          loop
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            console.log("Video ended - will loop");
            setIsPlaying(false);
          }}
          onLoadStart={() => console.log("Video load started")}
          onCanPlay={() => console.log("Video can play")}
          onCanPlayThrough={() => console.log("Video can play through")}
          onError={(e) => console.error("Video error event:", e)}
          onPlay={() => console.log("Video play event fired")}
          onPause={() => console.log("Video pause event fired")}
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={togglePlay}>
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Button size="sm" variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
