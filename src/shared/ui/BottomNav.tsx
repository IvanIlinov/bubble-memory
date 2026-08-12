"use client";

import { useRouter, usePathname } from "next/navigation";

type NavPath = "/" | "/rating" | "/profile" | "/mastery";

interface NavItem {
  href: NavPath;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/rating", label: "Рейтинг", icon: "🏆" },
  { href: "/profile", label: "Профиль", icon: "👤" },
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/mastery", label: "Мастерство", icon: "📚" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <nav
        className="flex items-center justify-center gap-4 px-6 py-3 rounded-full"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.65)",
          backdropFilter: "blur(20px)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-green"
                  : "text-foam-muted hover:text-foam"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
