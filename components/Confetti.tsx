"use client";

import { useEffect, useState } from "react";

const confettiEmojis = ["🎉", "✨", "🎊", "🌟", "💫", "⭐", "🔥", "💎"];

export function Confetti() {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    emoji: string;
    left: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    setConfetti(items);

    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (confetti.length === 0) return null;

  return (
    <div className="confetti-container">
      {confetti.map((item) => (
        <div
          key={item.id}
          className="confetti"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
