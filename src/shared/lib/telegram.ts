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
  return window.Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TelegramUser | null {
  const webApp = getTelegramWebApp();
  return webApp?.initDataUnsafe?.user ?? null;
}

export function getTelegramInitData(): string {
  const webApp = getTelegramWebApp();
  return webApp?.initData ?? "";
}

// Ждём инициализации WebApp
export function waitForTelegramWebApp(): Promise<TelegramWebApp> {
  return new Promise((resolve) => {
    const tg = getTelegramWebApp();
    if (tg && tg.initData) {
      resolve(tg);
      return;
    }

    // Ждём события ready от WebApp
    const handleReady = () => {
      const tg = getTelegramWebApp();
      if (tg) {
        resolve(tg);
        window.removeEventListener("tgWebAppReady", handleReady);
      }
    };

    window.addEventListener("tgWebAppReady", handleReady);
    
    // Таймаут на случай если событие не придёт
    setTimeout(() => {
      const tg = getTelegramWebApp();
      if (tg) resolve(tg);
      window.removeEventListener("tgWebAppReady", handleReady);
    }, 2000);
  });
}
