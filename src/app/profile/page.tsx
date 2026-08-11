"use client";

import { useEffect, useState } from "react";
import { ProfileCircle } from "@/widgets/profile-circle/ui/ProfileCircle";
import { ProgressBar } from "@/shared/ui/ProgressBar";

interface ProfileData {
  user: {
    id: string;
    displayName: string;
    bubbleTier: string;
  };
  stats: {
    totalRepetitions: number;
    yearRepetitions: number;
    weekRepetitions: number;
    masteredCount: number;
    totalTasks: number;
    lifetimeDays: number;
    lifetimeFormatted: string;
  };
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const initData = window.Telegram?.WebApp?.initData || "";
        
        const response = await fetch("/api/profile", {
          headers: {
            "x-telegram-init-data": initData,
          },
        });

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData.error || `HTTP ${response.status}`);
        }

        const profileData = await response.json();
        setData(profileData);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foam-muted">Загрузка профиля...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-coral font-semibold">Ошибка загрузки</div>
        <div className="text-foam-muted text-sm">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foam text-sm"
        >
          Попробовать ещё
        </button>
      </div>
    );
  }

  const { user, stats } = data;

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-foam">
            {user.displayName}
          </h1>
        </div>

        <div className="flex justify-center">
          <ProfileCircle
            totalRepetitions={stats.totalRepetitions}
            yearTarget={2000}
          />
        </div>

        <div className="rounded-3xl backdrop-blur-20 p-6 space-y-6"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65)",
          }}
        >
          <ProgressBar
            label="Неделя"
            icon="📅"
            current={stats.weekRepetitions}
            target={27}
            unit="задач"
            color="mint"
          />

          <ProgressBar
            label="Решено"
            icon="✅"
            current={stats.totalRepetitions}
            target={2000}
            unit=""
            color="green"
          />

          <ProgressBar
            label="Изучено"
            icon="📚"
            current={stats.masteredCount}
            target={stats.totalTasks}
            unit=""
            color="lime"
          />

          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm">⏱️</span>
            <span className="text-sm font-medium text-foam">{stats.lifetimeDays} дня</span>
          </div>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
