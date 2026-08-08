export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date: number;
    hash: string;
  };
  ready: () => void;
  expand: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const tg = window.Telegram?.WebApp;
  console.log("🔍 getTelegramWebApp:", {
    exists: !!tg,
    hasInitData: !!tg?.initData,
    initDataLength: tg?.initData?.length || 0,
    hasUser: !!tg?.initDataUnsafe?.user,
  });
  return tg ?? null;
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  const user = webApp?.initDataUnsafe?.user ?? null;
  console.log("🔍 getTelegramUser:", user);
  return user;
}

export function getTelegramInitData(): string {
  const webApp = getTelegramWebApp();
  const data = webApp?.initData ?? "";
  console.log("🔍 getTelegramInitData length:", data.length);
  return data;
}

export function debugTelegram() {
  console.log("🔍 === DEBUG TELEGRAM ===");
  console.log("window.Telegram:", typeof window !== "undefined" ? window.Telegram : "N/A");
  console.log("window.Telegram?.WebApp:", typeof window !== "undefined" ? window.Telegram?.WebApp : "N/A");
  
  const tg = getTelegramWebApp();
  if (tg) {
    console.log("initData:", tg.initData?.substring(0, 50) + "...");
    console.log("initDataUnsafe:", tg.initDataUnsafe);
  }
  console.log("🔍 === END DEBUG ===");
}
