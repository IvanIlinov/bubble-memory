"use client";

import { useEffect, useState } from "react";
import { MasteryTabs } from "./MasteryTabs";

export default function MasteryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/profile", {
          headers: {
            "x-telegram-init-data": window.Telegram?.WebApp?.initData || "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load mastery data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foam-muted">Загрузка мастерства...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-coral">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foam">Мастерство</h1>
        </div>

        <MasteryTabs />

        <div className="h-20" />
      </div>
    </div>
  );
}
