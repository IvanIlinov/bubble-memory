"use client";

const COLOR_STOPS = [
  { r: 239, g: 68,  b: 68  }, // red
  { r: 247, g: 171, b: 77  }, // orange
  { r: 246, g: 247, b: 156 }, // amber
  { r: 205, g: 238, b: 106 }, // lime
  { r: 134, g: 239, b: 172 }, // mint
  { r: 74,  g: 222, b: 128 }, // green
];

function interpolateColor(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (COLOR_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), COLOR_STOPS.length - 2);
  const f = scaled - i;
  const a = COLOR_STOPS[i]!;
  const b = COLOR_STOPS[i + 1]!;
  return {
    r: Math.round(a.r + (b.r - a.r) * f),
    g: Math.round(a.g + (b.g - a.g) * f),
    b: Math.round(a.b + (b.b - a.b) * f),
  };
}

function toRgb({ r, g, b }: { r: number; g: number; b: number }) {
  return `rgb(${r},${g},${b})`;
}

function arcPath(startAngle: number, endAngle: number, r = 46, cx = 50, cy = 50) {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const SEGMENTS = 60;

export function WeekBubble({ totalReps }: { totalReps: number }) {
  const target = 27;
  const progress = Math.min(totalReps / target, 1);

  const endColor = interpolateColor(progress);
  const glowRgb = `${endColor.r},${endColor.g},${endColor.b}`;

  // Начало сверху, без rotate на SVG
  const startAngle = -Math.PI / 2;
  const totalAngle = 2 * Math.PI * progress;
  const activeSegments = Math.max(1, Math.round(SEGMENTS * progress));

  return (
    <div className="flex flex-col items-center gap-3 -ml-4">
      <div className="relative">
        <div
          className="absolute -inset-4 rounded-full blur-2xl opacity-40"
          style={{
            background: `radial-gradient(circle, rgba(${glowRgb},0.35) 0%, transparent 70%)`,
          }}
        />
        <div
          className="relative h-[11.75rem] w-[11.75rem] sm:h-[13.75rem] sm:w-[13.75rem] lg:h-[16.75rem] lg:w-[16.75rem] rounded-full flex items-center justify-center"
          role="img"
          aria-label={`Пузырь памяти: ${totalReps} повторений`}
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px -16px rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {/* Фоновая окружность */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />

            {progress > 0 && Array.from({ length: activeSegments }, (_, i) => {
              const tStart = i / activeSegments;
              const tEnd = (i + 1) / activeSegments;
              // цвет идёт от 0 до progress по шкале
              const color = interpolateColor(tStart * progress);
              const segStart = startAngle + totalAngle * tStart;
              const segEnd = startAngle + totalAngle * tEnd;
              const isLast = i === activeSegments - 1;
              return (
                <path
                  key={i}
                  d={arcPath(segStart, segEnd)}
                  fill="none"
                  stroke={toRgb(color)}
                  strokeWidth="4"
                  strokeLinecap={isLast ? "round" : "butt"}
                />
              );
            })}

            {/* Скруглённый старт */}
            {progress > 0 && (
              <circle
                cx={50 + 46 * Math.cos(startAngle)}
                cy={50 + 46 * Math.sin(startAngle)}
                r="2"
                fill={toRgb(interpolateColor(0))}
              />
            )}

            {/* Свечение конца */}
            {progress > 0 && (
              <circle
                cx={50 + 46 * Math.cos(startAngle + totalAngle)}
                cy={50 + 46 * Math.sin(startAngle + totalAngle)}
                r="2.5"
                fill={toRgb(endColor)}
                style={{ filter: `drop-shadow(0 0 4px rgba(${glowRgb},0.9))` }}
              />
            )}
          </svg>

          <div className="flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-semibold text-foam">{totalReps}</span>
            <span className="mt-1 text-[11px] uppercase tracking-wide text-foam-muted">повторений</span>
          </div>
        </div>
      </div>

      <div className="w-full mt-1" style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent 0%, rgba(${glowRgb},0.3) 40%, rgba(${glowRgb},0.3) 60%, transparent 100%)`,
        boxShadow: `0 0 8px 0px rgba(${glowRgb},0.2)`,
      }} />
    </div>
  );
}
