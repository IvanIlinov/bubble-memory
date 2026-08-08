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

export function getTelegramInitData(): string {
  if (typeof window === "undefined") return "";

  const tg = (window as any).Telegram?.WebApp?.initData;
  if (tg) {
    console.log("✓ initData from window.Telegram.WebApp");
    return tg;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("initData") || params.get("tgWebAppData");
    if (fromUrl) {
      console.log("✓ initData from URL params");
      return fromUrl;
    }
  } catch (e) {
    console.log("URL params error:", e);
  }

  try {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const fromHash = hash.get("initData") || hash.get("tgWebAppData");
    if (fromHash) {
      console.log("✓ initData from URL hash");
      return fromHash;
    }
  } catch (e) {
    console.log("Hash error:", e);
  }

  console.log("✗ initData not found");
  console.log("  window.location:", {
    href: window.location.href.substring(0, 100),
    search: window.location.search.substring(0, 100),
    hash: window.location.hash.substring(0, 100),
  });

  return "";
}

export function getTelegramUser(): TelegramUser | null {
  const initData = getTelegramInitData();
  if (!initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("✓ Telegram user:", user.first_name);
      return user;
    }
  } catch (e) {
    console.log("User parse error:", e);
  }

  return null;
}
