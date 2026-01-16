"use client";

import { useEffect, useRef, useCallback } from "react";
import { debounce } from "@/lib/debounce";

interface YouTubeEmbedProps {
  youtubeId: string;
  title?: string;
  onWatchTimeUpdate?: (seconds: number) => void;
}

export function YouTubeEmbed({ youtubeId, title, onWatchTimeUpdate }: YouTubeEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((seconds: number) => {
      if (onWatchTimeUpdate) {
        onWatchTimeUpdate(seconds);
      }
    }, 10000), // Debounce 10 seconds
    [onWatchTimeUpdate]
  );

  useEffect(() => {
    // Simulate watch time tracking
    // Trong thực tế, cần dùng YouTube IFrame API để track chính xác
    // Ở đây ta giả lập: mỗi 5 giây cộng thêm 5 giây watch time
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastUpdateRef.current) / 1000; // seconds
      
      // Chỉ track nếu iframe đang visible và user đang ở tab
      if (document.visibilityState === "visible" && iframeRef.current) {
        // Giả lập: coi như user đang xem
        const watchSeconds = Math.min(elapsed, 5); // Max 5s mỗi lần update
        if (watchSeconds > 0) {
          debouncedUpdate(watchSeconds);
          lastUpdateRef.current = now;
        }
      }
    }, 5000); // Update mỗi 5 giây

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [debouncedUpdate]);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-titan-border bg-black">
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
        title={title || "Video bài học"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
