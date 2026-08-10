"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import type { MemoryColor } from "@/shared/config/memoryColors";

const MEMORY_COLOR_CLASS: Record<MemoryColor, string> = {
  none: "bg-memory-none",
  blue: "bg-memory-blue",
  green: "bg-memory-green",
  yellow: "bg-memory-yellow",
  orange: "bg-memory-orange",
  red: "bg-memory-red",
  black: "bg-memory-black",
};

const MEMORY_COLOR_GLOW: Record<MemoryColor, string> = {
  none: "shadow-[0_0_12px_-4px_rgba(82,216,224,0.15)]",
  blue: "shadow-[0_0_20px_-3px_rgba(79,168,224,0.85)]",
  green: "shadow-[0_0_20px_-3px_rgba(76,201,138,0.85)]",
  yellow: "shadow-[0_0_20px_-3px_rgba(232,212,77,0.85)]",
  orange: "shadow-[0_0_20px_-3px_rgba(232,149,77,0.85)]",
  red: "shadow-[0_0_20px_-3px_rgba(224,85,79,0.9)]",
  black: "shadow-[0_0_20px_-3px_rgba(0,0,0,0.9)]",
};

export interface BubbleProps {
  number: number;
  color: MemoryColor;
  statusText: string;
  alreadyReviewedToday?: boolean;
  onReview?: () => void | Promise<void>;
  size?: "sm" | "md";
}

export function Bubble({
  number,
  color,
  statusText,
  alreadyReviewedToday = false,
  onReview,
  size = "md",
}: BubbleProps) {
  const [showStatus, setShowStatus] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapProcessed = useRef(false);

  function handlePressStart() {
    tapProcessed.current = false;
    pressTimer.current = setTimeout(() => setShowStatus(true), 420);
  }

  function handlePressEnd() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handleTap() {
    if (tapProcessed.current) return;
    tapProcessed.current = true;

    if (showStatus) {
      setShowStatus(false);
      return;
    }
    triggerHaptic();
    onReview?.();
  }

  function triggerHaptic() {
    const tg = (globalThis as any)?.Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.(alreadyReviewedToday ? "light" : "medium");
  }

  const dimension = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        type="button"
        aria-label={`Задание ${number}. ${statusText}`}
        onPointerDown={handlePressStart}
        onPointerUp={() => { handlePressEnd(); handleTap(); }}
        onPointerLeave={() => {
          handlePressEnd();
          setShowStatus(false);
        }}
        onTouchEnd={() => { handlePressEnd(); handleTap(); }}
        whileTap={{ scale: 0.88 }}
        animate={alreadyReviewedToday ? { scale: [1, 1.12, 1] } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
        className={cn(
          "relative flex items-center justify-center rounded-full font-body font-semibold text-deep/90",
          "ring-1 ring-white/10 backdrop-blur-sm transition-colors",
          dimension,
          MEMORY_COLOR_CLASS[color],
          MEMORY_COLOR_GLOW[color],
          color === "none" && "text-foam-muted",
          color === "black" && "text-foam",
        )}
      >
        {number}
      </motion.button>

      {showStatus && (
        <div
          role="status"
          className="absolute -top-9 z-10 whitespace-nowrap rounded-md bg-deep-panel2 px-2 py-1 text-[11px] text-foam shadow-lg ring-1 ring-white/10"
        >
          {statusText}
        </div>
      )}
    </div>
  );
}
