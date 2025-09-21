"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Music,
  Search,
  Play,
  Pause,
  Download,
  Heart,
  TrendingUp,
  Clock,
  Volume2,
  Headphones,
  Mic,
  Wand2,
  Loader2,
} from "lucide-react"

const soundCategories = [
  { name: "Trending", icon: TrendingUp, count: 1234 },
  { name: "Pop", icon: Music, count: 856 },
  { name: "Hip Hop", icon: Headphones, count: 743 },
  { name: "Electronic", icon: Volume2, count: 621 },
  { name: "Acoustic", icon: Mic, count: 445 },
  { name: "Ambient", icon: Clock, count: 332 },
]

// Music file data interface
interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  duration: string;
  uses: string;
  category: string;
  trending: boolean;
  liked: boolean;
  filename: string;
  audioUrl: string;
}

// Parse filename to extract track info
const parseFilename = (filename: string, id: number): MusicTrack => {
  // Remove .mp3 extension and extract title/artist info
  const nameWithoutExt = filename.replace('.mp3', '');
  
  // Try to parse artist - title format
  let title = nameWithoutExt;
  let artist = "Unknown Artist";
  
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ');
    artist = parts[0].trim();
    title = parts[1].trim();
  } else if (nameWithoutExt.includes(' by ')) {
    const parts = nameWithoutExt.split(' by ');
    title = parts[0].trim();
    artist = parts[1].trim();
  }
  
  // Remove YouTube ID if present [ID]
  title = title.replace(/\s*\[[^\]]+\]$/, '');
  
  // Determine category based on title/artist
  const lowerTitle = title.toLowerCase();
  const lowerArtist = artist.toLowerCase();
  const fullName = nameWithoutExt.toLowerCase();
  let category = "Pop";
  
  if (lowerTitle.includes('electronic') || lowerTitle.includes('techno') || 
      fullName.includes('alan walker') || lowerTitle.includes('remix')) {
    category = "Electronic";
  } else if (lowerTitle.includes('hip hop') || lowerTitle.includes('rap')) {
    category = "Hip Hop";
  } else if (lowerTitle.includes('acoustic') || lowerTitle.includes('guitar')) {
    category = "Acoustic";
  } else if (lowerTitle.includes('ambient') || lowerTitle.includes('chill') || 
             lowerArtist.includes('chopin') || lowerTitle.includes('nocturne') ||
             lowerArtist.includes('leadwave')) {
    category = "Ambient";
  }
  
  return {
    id,
    title,
    artist,
    duration: "0:00", // Will be updated when audio loads
    uses: `${Math.floor(Math.random() * 500) + 100}K`,
    category,
    trending: Math.random() > 0.5, // Random trending status
    liked: false,
    filename,
    audioUrl: `/music/${filename}`
  };
};

// Static list of music files (in a real app, this could be fetched from an API)
const musicFiles = [
  "The Marías - Sienna (Visualizer) [EiS7cKfuf6w].mp3",
  "Rasa & Takdir [69281qoEtSM].mp3",
  "Lily - Tiktok Remix- Alan Walker, K-391, Emelie Hollow [FxdV5_xtU0I].mp3",
  "leadwave - memories [PB7voPuuELY].mp3",
  "Chopin - Nocturne op.9 No.2 [9E6b3swbnWg].mp3"
];

const trendingSounds = musicFiles.map((filename, index) => parseFilename(filename, index + 1))

export function SoundsLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("Trending")
  const [playingSound, setPlayingSound] = useState<number | null>(null)
  const [likedSounds, setLikedSounds] = useState<number[]>([2, 4])
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Music generation state
  const [musicPrompt, setMusicPrompt] = useState({
    lyrics_prompt: "",
    prompt: ""
  })
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState<MusicTrack | null>(null)
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setPlayingSound(null)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Initialize audio on first user interaction
  const initializeAudio = async () => {
    if (audioInitialized) return
    
    const audio = audioRef.current
    if (!audio) return
    
    try {
      // Create a silent audio context to unlock audio
      const silentTrack = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA=="
      audio.src = silentTrack
      audio.volume = 0
      await audio.play()
      audio.pause()
      audio.volume = 1
      setAudioInitialized(true)
      console.log('Audio context initialized')
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }

  const togglePlay = async (track: MusicTrack) => {
    const audio = audioRef.current
    if (!audio) {
      console.error('Audio element not found')
      return
    }

    // Initialize audio context on first interaction
    await initializeAudio()

    try {
      if (playingSound === track.id && isPlaying) {
        // Pause current track
        audio.pause()
        setIsPlaying(false)
        console.log('Paused:', track.title)
      } else if (playingSound === track.id && !isPlaying) {
        // Resume current track
        console.log('Resuming:', track.title)
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          await playPromise
        }
        setIsPlaying(true)
        console.log('Resumed:', track.title)
      } else {
        // Play new track
        console.log('Loading new track:', track.title, 'URL:', track.audioUrl)
        
        // Stop current audio first
        audio.pause()
        audio.currentTime = 0
        
        setCurrentTrack(track)
        setPlayingSound(track.id)
        setIsPlaying(false)
        
        // Set source and load
        audio.src = track.audioUrl
        console.log('Audio source set to:', audio.src)
        
        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          let resolved = false
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true
              cleanup()
              reject(new Error('Audio loading timeout (10 seconds)'))
            }
          }, 10000)
          
          const onCanPlay = () => {
            if (!resolved) {
              resolved = true
              cleanup()
              console.log('Audio ready to play')
              resolve(true)
            }
          }
          
          const onError = (e: any) => {
            if (!resolved) {
              resolved = true
              cleanup()
              console.error('Audio loading error:', e)
              reject(new Error(`Audio loading failed: ${e.type || 'Unknown error'}`))
            }
          }
          
          const onLoadedData = () => {
            if (!resolved) {
              resolved = true
              cleanup()
              console.log('Audio data loaded')
              resolve(true)
            }
          }
          
          const cleanup = () => {
            clearTimeout(timeout)
            audio.removeEventListener('canplay', onCanPlay)
            audio.removeEventListener('loadeddata', onLoadedData)
            audio.removeEventListener('error', onError)
          }
          
          audio.addEventListener('canplay', onCanPlay)
          audio.addEventListener('loadeddata', onLoadedData)
          audio.addEventListener('error', onError)
          
          // Load the audio
          audio.load()
        })
        
        // Now try to play
        console.log('Attempting to play audio...')
        const playPromise = audio.play()
        
        if (playPromise !== undefined) {
          await playPromise
        }
        
        setIsPlaying(true)
        console.log('Successfully playing:', track.title)
      }
    } catch (error) {
      console.error('Audio playback error:', error)
      setIsPlaying(false)
      setPlayingSound(null)
      
      // More detailed error message
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error)
      }
      
      console.error('Detailed error:', errorMessage)
      alert(`Failed to play audio: ${errorMessage}`)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleLike = (soundId: number) => {
    setLikedSounds((prev) => (prev.includes(soundId) ? prev.filter((id) => id !== soundId) : [...prev, soundId]))
  }

  const generateMusic = async () => {
    if (!musicPrompt.lyrics_prompt.trim() || !musicPrompt.prompt.trim()) {
      return;
    }

    setIsGeneratingMusic(true);
    
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(musicPrompt),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        if (result.musicUrl) {
          // Music is ready immediately
          const newTrack: MusicTrack = {
            id: Date.now(), // Use timestamp as unique ID
            title: result.metadata?.title || "Generated Track",
            artist: result.metadata?.artist || "AI Composer",
            duration: result.metadata?.duration || "3:30",
            uses: "1",
            category: "AI Generated",
            trending: false,
            liked: false,
            filename: `generated-${Date.now()}.mp3`,
            audioUrl: result.musicUrl
          };
          
          setGeneratedMusic(newTrack);
          
          // Optionally auto-play the generated track
          togglePlay(newTrack);
        } else if (result.taskId) {
          // Music generation in progress, would need polling
          console.log('Music generation started, task ID:', result.taskId);
          // For now, show a placeholder
          const newTrack: MusicTrack = {
            id: Date.now(),
            title: "Generated Track (Processing...)",
            artist: "AI Composer",
            duration: "3:30",
            uses: "1",
            category: "AI Generated",
            trending: false,
            liked: false,
            filename: `generated-${Date.now()}.mp3`,
            audioUrl: result.musicUrl || ""
          };
          setGeneratedMusic(newTrack);
        }
      } else {
        console.error('Music generation failed:', result.error);
        alert('Music generation failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Music generation error:', error);
      alert('Music generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGeneratingMusic(false);
    }
  }

  const filteredSounds =
    selectedCategory === "Trending"
      ? trendingSounds.filter((sound) => sound.trending)
      : trendingSounds.filter((sound) => sound.category === selectedCategory)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Music className="h-6 w-6 text-chart-3" />
              Unlimited Sounds
            </h1>
            <p className="text-sm text-gray-600">Discover and use trending audio for your videos</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search sounds..." className="pl-10 w-64" />
            </div>
            <Button className="bg-accent hover:bg-accent/90">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
            <Button 
              onClick={async () => {
                console.log('Testing audio system...');
                const testTrack = trendingSounds[0];
                console.log('Test track:', testTrack);
                console.log('Audio URL:', testTrack.audioUrl);
                
                try {
                  // Test 1: URL accessibility
                  console.log('Testing URL accessibility...');
                  const response = await fetch(testTrack.audioUrl, { method: 'HEAD' });
                  console.log('URL test result:', response.status, response.statusText);
                  
                  if (!response.ok) {
                    alert('Audio URL failed: ' + response.status);
                    return;
                  }
                  
                  // Test 2: Create and test audio element
                  console.log('Testing direct audio playback...');
                  const testAudio = new Audio(testTrack.audioUrl);
                  
                  await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                      reject(new Error('Audio loading timeout'));
                    }, 5000);
                    
                    testAudio.oncanplay = () => {
                      clearTimeout(timeout);
                      console.log('Test audio can play');
                      resolve(true);
                    };
                    
                    testAudio.onerror = (e) => {
                      clearTimeout(timeout);
                      console.error('Test audio error:', e);
                      reject(new Error('Audio loading error'));
                    };
                    
                    testAudio.load();
                  });
                  
                  // Try to play for a brief moment
                  await testAudio.play();
                  setTimeout(() => {
                    testAudio.pause();
                    testAudio.currentTime = 0;
                  }, 500);
                  
                  alert('✅ Audio system test successful!');
                  
                } catch (error) {
                  console.error('Audio test error:', error);
                  alert('❌ Audio test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                }
              }}
              variant="outline"
              size="sm"
            >
              Test Audio
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-8 pb-8">

      {/* Categories */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {soundCategories.map((category) => (
          <Button
            key={category.name}
            variant={selectedCategory === category.name ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.name)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <category.icon className="h-4 w-4" />
            {category.name}
            <Badge variant="secondary" className="ml-1">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* AI Music Generation */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Wand2 className="h-5 w-5" />
            🎵 AI Music Generator
          </CardTitle>
          <CardDescription>Create custom music tracks with WaveSpeed AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Music Style & Mood</label>
                <Input
                  placeholder="e.g., pop, upbeat, inspirational, feel-good, hopeful"
                  value={musicPrompt.lyrics_prompt}
                  onChange={(e) => setMusicPrompt({...musicPrompt, lyrics_prompt: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Describe the style, genre, and mood you want</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Lyrics/Theme</label>
                <textarea
                  className="w-full p-3 border rounded-lg resize-none h-24 text-sm"
                  placeholder="[verse]Radio static, hadn't smiled in a while. A forgotten song came on...[chorus]That one song changed it all..."
                  value={musicPrompt.prompt}
                  onChange={(e) => setMusicPrompt({...musicPrompt, prompt: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Write lyrics or describe the theme/story</p>
              </div>
              
              <Button 
                onClick={generateMusic}
                disabled={isGeneratingMusic || !musicPrompt.lyrics_prompt.trim() || !musicPrompt.prompt.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGeneratingMusic ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Music...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Music Track
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-purple-700">Quick Examples</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMusicPrompt({
                    lyrics_prompt: "pop, upbeat, inspirational, feel-good, hopeful",
                    prompt: "[verse]Radio static, hadn't smiled in a while. A forgotten song came on, and blew away my care.[chorus]That one song changed it all. The hope a simple melody can bring."
                  })}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-xs">Upbeat Pop</div>
                    <div className="text-xs text-gray-500">Inspirational feel-good song</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMusicPrompt({
                    lyrics_prompt: "ambient, chill, relaxing, peaceful, meditative",
                    prompt: "[ambient]Soft waves washing ashore, gentle breeze through trees. Finding peace in simple moments, breathing deep and free."
                  })}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-xs">Ambient Chill</div>
                    <div className="text-xs text-gray-500">Relaxing background music</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMusicPrompt({
                    lyrics_prompt: "electronic, energetic, dance, party, uplifting",
                    prompt: "[drop]Lights flash, bass drops, energy rising. Dance floor calling, hearts colliding. Tonight we're alive, nothing can stop us."
                  })}
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div>
                    <div className="font-medium text-xs">Electronic Dance</div>
                    <div className="text-xs text-gray-500">High-energy party track</div>
                  </div>
                </Button>
              </div>
              
              {generatedMusic && (
                <div className="mt-4 p-4 bg-white/60 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-sm mb-2">🎉 Generated Track Ready!</h5>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => generatedMusic && togglePlay(generatedMusic)}>
                      {playingSound === generatedMusic.id && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{generatedMusic.title}</div>
                      <div className="text-xs text-gray-600">{generatedMusic.artist}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Music Highlight */}
      {selectedCategory === "Trending" && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-5 w-5" />
              🎵 Trending Music Now
            </CardTitle>
            <CardDescription>
              Discover the hottest tracks that are trending across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingSounds.filter(track => track.trending).slice(0, 3).map((track) => (
                <div key={track.id} className="bg-white/60 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Music className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => togglePlay(track)}>
                      {playingSound === track.id && isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sounds Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedCategory} Sounds ({filteredSounds.length})
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Most Popular
            </Button>
            <Button variant="outline" size="sm">
              Newest
            </Button>
            <Button variant="outline" size="sm">
              Duration
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredSounds.map((sound) => (
            <Card key={sound.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                      <Music className="h-6 w-6 text-chart-3" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{sound.title}</h3>
                      <p className="text-sm text-muted-foreground">by {sound.artist}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {playingSound === sound.id && duration ? formatTime(duration) : sound.duration}
                        </span>
                        <span className="text-xs text-muted-foreground">{sound.uses} uses</span>
                        <Badge variant="outline" className="text-xs">
                          {sound.category}
                        </Badge>
                        {sound.trending && (
                          <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => togglePlay(sound)}>
                      {playingSound === sound.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLike(sound.id)}
                      className={likedSounds.includes(sound.id) ? "text-chart-1" : ""}
                    >
                      <Heart className={`h-4 w-4 ${likedSounds.includes(sound.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="bg-chart-1 hover:bg-chart-1/90">
                      Use Sound
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
          </div>
        </ScrollArea>
      </div>

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        preload="none"
        onError={(e) => console.error('Audio element error:', e)}
        onLoadStart={() => console.log('Audio load started')}
        onCanPlay={() => console.log('Audio can play')}
        onPlay={() => console.log('Audio play event')}
        onPause={() => console.log('Audio pause event')}
      />

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{currentTrack.title}</h4>
                <p className="text-xs text-gray-600">{currentTrack.artist}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
              <span className="text-xs text-gray-500 w-12">{formatTime(currentTime)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-purple-600 h-1 rounded-full transition-all duration-100"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => currentTrack && togglePlay(currentTrack)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
