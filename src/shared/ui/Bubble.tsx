"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import type { MemoryColor } from "@/shared/config/memoryColors";

const MEMORY_COLOR_HEX: Record<MemoryColor, string> = {
  none: "#2A2E2F",
  blue: "#4FC3F7",
  green: "#3DDCC4",
  yellow: "#FFD166",
  orange: "#FFA35C",
  red: "#FF6B6B",
  black: "#101314",
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
    if (showStatus) { setShowStatus(false); return; }
    triggerHaptic();
    onReview?.();
  }

  function triggerHaptic() {
    const tg = (globalThis as any)?.Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.(alreadyReviewedToday ? "light" : "medium");
  }

  const hex = MEMORY_COLOR_HEX[color];
  const isNone = color === "none";
  const dimension = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        type="button"
        aria-label={`Задание ${number}. ${statusText}`}
        onPointerDown={handlePressStart}
        onPointerUp={() => { handlePressEnd(); handleTap(); }}
        onPointerLeave={() => { handlePressEnd(); setShowStatus(false); }}
        onTouchEnd={() => { handlePressEnd(); handleTap(); }}
        whileTap={{ scale: 0.9 }}
        animate={alreadyReviewedToday ? { scale: [1, 1.08, 1] } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className={cn(
          "relative flex items-center justify-center rounded-full font-body font-medium",
          "transition-colors select-none",
          dimension,
        )}
        style={{
          background: isNone
            ? "linear-gradient(160deg, #333739 0%, #232728 100%)"
            : `linear-gradient(160deg, ${hex}cc 0%, ${hex}88 100%)`,
          boxShadow: isNone
            ? [
              "0 0 0 1px rgba(255,255,255,0.09)",
              "inset 0 1px 0 rgba(255,255,255,0.10)",
              "0 4px 12px -4px rgba(0,0,0,0.55)",
            ].join(", ")
            : [
              `0 0 0 1px ${hex}55`,
              `inset 0 1px 0 rgba(255,255,255,0.22)`,
              `0 0 14px -4px ${hex}99`,
              `0 4px 12px -4px rgba(0,0,0,0.4)`,
            ].join(", "),
          color: isNone ? "rgba(255,255,255,0.35)" : "#0D0F0F",
        }}
      >
        {number}
      </motion.button>

      {showStatus && (
        <div
          role="status"
          className="absolute -top-9 z-10 whitespace-nowrap rounded-md px-2 py-1 text-[11px] text-foam shadow-lg ring-1 ring-white/10"
          style={{ background: "#1C2020" }}
        >
          {statusText}
        </div>
      )}
    </div>
  );
}