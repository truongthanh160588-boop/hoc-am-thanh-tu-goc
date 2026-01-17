"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { debounce } from "@/lib/debounce";

interface YouTubeEmbedProps {
  youtubeId: string;
  title?: string;
  onWatchTimeUpdate?: (seconds: number, duration: number) => void;
}

export function YouTubeEmbed({ youtubeId, title, onWatchTimeUpdate }: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const lastWatchTimeRef = useRef<number>(0);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((seconds: number, duration: number) => {
      if (onWatchTimeUpdate && seconds > lastWatchTimeRef.current) {
        onWatchTimeUpdate(seconds, duration);
        lastWatchTimeRef.current = seconds;
      }
    }, 5000), // Debounce 5 seconds
    [onWatchTimeUpdate]
  );

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Wait for API to load (max 10 seconds)
    let checkCount = 0;
    const maxChecks = 100; // 10 seconds max
    const checkYT = setInterval(() => {
      checkCount++;
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      } else if (checkCount >= maxChecks) {
        // Fallback: nếu YouTube API không load được, dùng simple tracking
        clearInterval(checkYT);
        console.warn("[YouTubeEmbed] YouTube API not loaded, using fallback tracking");
        startFallbackTracking();
      }
    }, 100);
    
    function startFallbackTracking() {
      // Fallback: track thời gian page visible (đơn giản hơn)
      let startTime = Date.now();
      fallbackIntervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible" && iframeRef.current) {
          const elapsed = (Date.now() - startTime) / 1000; // seconds
          // Giả sử video dài 5 phút (300s) nếu chưa biết duration
          const estimatedDuration = 300;
          if (onWatchTimeUpdate) {
            onWatchTimeUpdate(Math.min(elapsed, estimatedDuration), estimatedDuration);
          }
        }
      }, 2000);
    }

    function initPlayer() {
      if (!iframeRef.current) return;

      playerRef.current = new window.YT.Player(iframeRef.current, {
        videoId: youtubeId,
        events: {
          onReady: (event: any) => {
            const duration = event.target.getDuration();
            setVideoDuration(duration);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              startTracking();
            } else {
              stopTracking();
            }
          },
        },
      });
    }

    function startTracking() {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (playerRef.current && document.visibilityState === "visible") {
          try {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();
            if (currentTime > 0 && duration > 0) {
              // Update ngay lập tức để UI responsive hơn
              if (onWatchTimeUpdate) {
                onWatchTimeUpdate(currentTime, duration);
              }
              // Cũng gọi debounced để tránh quá nhiều update
              debouncedUpdate(currentTime, duration);
              
              // Debug log (có thể xóa sau)
              console.log(`[YouTubeEmbed] Watch time: ${Math.floor(currentTime)}s / ${Math.floor(duration)}s (${Math.floor((currentTime / duration) * 100)}%)`);
            }
          } catch (error) {
            // Player might not be ready
            console.warn("YouTube player not ready:", error);
          }
        }
      }, 2000); // Update mỗi 2 giây để responsive hơn
    }

    function stopTracking() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          // Ignore
        }
      }
    };
  }, [youtubeId, debouncedUpdate, onWatchTimeUpdate]);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-titan-border bg-black">
      <div ref={iframeRef} id={`youtube-player-${youtubeId}`} className="w-full h-full" />
    </div>
  );
}

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
