"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

type RatingPeriod = "global" | "week";

export default function RatingPage() {
  const [period, setPeriod] = useState<RatingPeriod>("global");

  return (
    <main className="min-h-screen bg-deep px-4 py-6 pb-24 text-foam">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={"/" as Route}
            className="text-foam-muted hover:text-foam transition-colors text-sm mb-4 inline-block"
          >
            ← назад
          </Link>
          <h1 className="font-display text-2xl text-foam mb-6">Рейтинг</h1>

          {/* Period Toggle */}
          <div className="flex gap-2 bg-deep-panel rounded-lg p-1 ring-1 ring-white/10">
            <button
              onClick={() => setPeriod("global")}
              className={`flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                period === "global"
                  ? "bg-living text-deep shadow-lg"
                  : "text-foam-muted hover:text-foam"
              }`}
            >
              Всё время
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                period === "week"
                  ? "bg-living text-deep shadow-lg"
                  : "text-foam-muted hover:text-foam"
              }`}
            >
              На неделю
            </button>
          </div>
        </header>

        {/* Placeholder */}
        <div className="space-y-3">
          <div className="rounded-xl bg-deep-panel p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gold">1</span>
                <div>
                  <p className="text-sm text-foam">Пользователь</p>
                  <p className="text-xs text-foam-muted">в разработке</p>
                </div>
              </div>
              <span className="text-gold font-semibold">∞ XP</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
