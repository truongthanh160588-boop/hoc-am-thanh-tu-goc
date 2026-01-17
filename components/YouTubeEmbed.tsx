"use client";

import { useEffect, useRef, useCallback } from "react";
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
  const lastWatchTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

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
    // Load YouTube IFrame API (chỉ load 1 lần)
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Wait for API to load và init player
    let checkCount = 0;
    const maxChecks = 100; // 10 seconds max
    const checkYT = setInterval(() => {
      checkCount++;
      if (window.YT && window.YT.Player && iframeRef.current && !playerRef.current) {
        clearInterval(checkYT);
        initPlayer();
      } else if (checkCount >= maxChecks) {
        clearInterval(checkYT);
        console.warn("[YouTubeEmbed] YouTube API not loaded, using simple tracking");
        // Fallback: track đơn giản dựa trên thời gian page visible
        startSimpleTracking();
      }
    }, 100);

    function initPlayer() {
      if (!iframeRef.current || playerRef.current) return;

      try {
        const containerId = `youtube-player-${youtubeId}`;
        if (iframeRef.current) {
          iframeRef.current.id = containerId;
        }

        playerRef.current = new window.YT.Player(containerId, {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              try {
                const duration = event.target.getDuration();
                if (duration > 0) {
                  console.log(`[YouTubeEmbed] Video duration: ${Math.floor(duration)}s`);
                }
              } catch (error) {
                console.warn("[YouTubeEmbed] Error getting duration:", error);
              }
            },
            onStateChange: (event: any) => {
              // YT.PlayerState.PLAYING = 1
              if (event.data === 1) {
                isPlayingRef.current = true;
                startTimeRef.current = Date.now();
                startTracking();
              } else {
                isPlayingRef.current = false;
                stopTracking();
              }
            },
            onError: (event: any) => {
              console.error("[YouTubeEmbed] Player error:", event.data);
            },
          },
        });
      } catch (error) {
        console.error("[YouTubeEmbed] Error initializing player:", error);
        startSimpleTracking();
      }
    }

    function startTracking() {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        if (playerRef.current && document.visibilityState === "visible" && isPlayingRef.current) {
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
            }
          } catch (error) {
            // Player might not be ready
            console.warn("[YouTubeEmbed] Error getting current time:", error);
          }
        }
      }, 2000); // Update mỗi 2 giây
    }

    function startSimpleTracking() {
      // Fallback: track thời gian page visible khi iframe đang hiển thị
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      let accumulatedTime = 0;
      let lastCheck = Date.now();
      
      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible" && iframeRef.current) {
          const now = Date.now();
          const elapsed = (now - lastCheck) / 1000; // seconds
          accumulatedTime += elapsed;
          lastCheck = now;
          
          // Giả sử video dài 5 phút (300s) nếu chưa biết duration
          const estimatedDuration = 300;
          if (onWatchTimeUpdate) {
            onWatchTimeUpdate(Math.min(accumulatedTime, estimatedDuration), estimatedDuration);
          }
        } else {
          lastCheck = Date.now();
        }
      }, 2000);
    }

    function stopTracking() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      // KHÔNG destroy player khi unmount để tránh reset video
      // Chỉ clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [youtubeId, debouncedUpdate, onWatchTimeUpdate]);

  // Luôn dùng iframe embed thông thường (đơn giản, ổn định)
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1`;

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-titan-border bg-black">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || "Video bài học"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        id={`youtube-player-${youtubeId}`}
      />
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
