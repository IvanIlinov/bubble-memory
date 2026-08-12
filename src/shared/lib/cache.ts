const CACHE_KEY = "bubble-memory-tasks-v3";
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 час

export interface CachedData {
  userId: string;
  user: any;
  tasks: any[];
  timestamp: number;
}

export function getCachedTasks(): CachedData | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);
    const age = Date.now() - data.timestamp;

    if (age < CACHE_EXPIRY) {
      return data;
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }

  return null;
}

export function setCachedTasks(data: CachedData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error("Cache write error:", error);
  }
}
