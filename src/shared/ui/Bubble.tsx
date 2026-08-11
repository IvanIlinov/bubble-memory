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
  none: "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
  blue: "shadow-[0_0_14px_-4px_rgba(79,195,247,0.7)]",
  green: "shadow-[0_0_14px_-4px_rgba(61,220,196,0.7)]",
  yellow: "shadow-[0_0_14px_-4px_rgba(255,209,102,0.7)]",
  orange: "shadow-[0_0_14px_-4px_rgba(255,163,92,0.7)]",
  red: "shadow-[0_0_14px_-4px_rgba(255,107,107,0.75)]",
  black: "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
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
        whileTap={{ scale: 0.9 }}
        animate={alreadyReviewedToday ? { scale: [1, 1.08, 1] } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className={cn(
          "relative flex items-center justify-center rounded-full font-body font-medium text-deep",
          "ring-1 ring-white/10 transition-colors",
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
