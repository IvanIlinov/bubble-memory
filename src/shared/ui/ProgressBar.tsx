"use client";

interface ProgressBarProps {
  label: string;
  icon: React.ReactNode;
  current: number;
  target?: number;
  unit?: string;
  color?: "mint" | "green" | "lime" | "amber" | "coral";
}

const colorClasses = {
  mint: "from-[#86EFAC] to-[#4ADE80]",
  green: "from-[#4ADE80] to-[#22C55E]",
  lime: "from-[#9CF7A8] to-[#86EFAC]",
  amber: "from-[#f6f79c] to-[#f7ab4d]",
  coral: "from-[#f7ab4d] to-[#F87171]",
};

export function ProgressBar({
  label,
  icon,
  current,
  target,
  unit = "",
  color = "green",
}: ProgressBarProps) {
  const progress = target ? Math.min((current / target) * 100, 100) : 100;
  const display = target ? `${current}/${target}` : `${current}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-sm font-medium text-foam">{label}</span>
        </div>
        <span className="text-xs font-medium text-foam-muted">
          {display} {unit}
        </span>
      </div>

      <div className="relative h-2 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10">
        <div
          className={`absolute inset-y-0 left-0 h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressStat({
  label,
  icon,
  value,
  subtext?: string,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-sm font-medium text-foam">{label}</span>
      </div>
      <div className="text-lg font-semibold text-foam">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-foam-muted">{subtext}</div>
      )}
    </div>
  );
}
