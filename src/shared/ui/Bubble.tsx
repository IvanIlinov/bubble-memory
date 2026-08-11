"use client";

import { useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { MemoryColor } from "@/shared/config/memoryColors";
import { isPulsing, pulseIntensity } from "@/entities/task-memory/lib/memoryFormula";

const MEMORY_COLOR_HEX: Record<MemoryColor, string> = {
  none: "#2A2E2F",
  green: "#4ADE80",
  mint: "#86EFAC",
  lime: "#9CF7A8",
  amber: "#f6f79c",
  orange: "#FB923C",
  coral: "#F87171",
  red: "#EF4444",
};

export interface BubbleProps {
  number: number;
  color: MemoryColor;
  statusText: string;
  memoryPercent?: number;
  stabilityDays?: number;
  alreadyReviewedToday?: boolean;
  onReview?: () => void | Promise<void>;
  size?: "sm" | "md";
}

export function Bubble({
  number,
  color,
  statusText,
  memoryPercent = 0,
  stabilityDays = 0,
  alreadyReviewedToday = false,
  onReview,
  size = "md",
}: BubbleProps) {
  const [showStatus, setShowStatus] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const touchFired = useRef(false);

  function handleTouchStart() {
    didLongPress.current = false;
    touchFired.current = false;
    setPressed(true);
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowStatus(true);
    }, 420);
  }

  function handleTouchEnd() {
    touchFired.current = true;
    setPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (didLongPress.current) {
      setShowStatus(false);
      return;
    }
    onReview?.();
  }

  function handleClick() {
    if (touchFired.current) { touchFired.current = false; return; }
    if (showStatus) { setShowStatus(false); return; }
    onReview?.();
  }

  const hex = MEMORY_COLOR_HEX[color];
  const isNone = color === "none";
  const pulsing = !isNone && isPulsing(memoryPercent);
  const intensity = pulsing ? pulseIntensity(memoryPercent) : 0;
  const pulseScale = 1 + 0.06 * intensity;
  const dimension = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  const boxShadow = isNone
    ? [
      "0 0 0 1px rgba(255,255,255,0.09)",
      "inset 0 1px 0 rgba(255,255,255,0.10)",
      "0 4px 12px -4px rgba(0,0,0,0.55)",
    ].join(", ")
    : [
      `0 0 0 1px ${hex}55`,
      `inset 0 1px 0 rgba(255,255,255,0.22)`,
      `0 0 ${pulsing ? 20 : 14}px -4px ${hex}${pulsing ? "cc" : "99"}`,
      `0 4px 12px -4px rgba(0,0,0,0.4)`,
    ].join(", ");

  const pulseKeyframes = pulsing
    ? `@keyframes bubble-pulse-${number} { 0%, 100% { transform: scale(1); } 50% { transform: scale(${pulseScale}); } }`
    : "";

  return (
    <div className="relative flex flex-col items-center">
      {pulsing && <style>{pulseKeyframes}</style>}
      <button
        type="button"
        aria-label={`Задание ${number}. ${statusText}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className={cn(
          "relative flex items-center justify-center rounded-full font-body font-medium select-none",
          dimension,
        )}
        style={{
          background: isNone
            ? "linear-gradient(160deg, #333739 0%, #232728 100%)"
            : `linear-gradient(160deg, ${hex}cc 0%, ${hex}88 100%)`,
          boxShadow,
          color: isNone ? "rgba(255,255,255,0.35)" : "#0D0F0F",
          transform: pressed ? "scale(0.93)" : "scale(1)",
          transition: "transform 0.15s ease-out, background 0.3s ease-out",
          animation: pulsing ? `bubble-pulse-${number} 2s ease-in-out infinite` : undefined,
          willChange: "transform",
        }}
      >
        {number}
      </button>

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
