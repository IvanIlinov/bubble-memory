import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Bubble Memory",
  description: "Трекер памяти по заданиям ЕГЭ Информатика",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#071620",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('📍 Layout script executing');
              console.log('window.Telegram before:', typeof window.Telegram);
              
              // Проверяем есть ли уже Telegram
              if (window.Telegram?.WebApp) {
                console.log('✓ window.Telegram.WebApp уже доступна!');
                window.Telegram.WebApp.ready?.();
              } else {
                console.log('⏳ Telegram SDK ещё не загружен, загружаем...');
                
                // Пробуем загрузить
                const script = document.createElement('script');
                script.src = 'https://telegram.org/js/telegram-web-app.js';
                script.async = true;
                
                script.onload = () => {
                  console.log('✓ SDK script loaded');
                  if (window.Telegram?.WebApp) {
                    console.log('✓ window.Telegram.WebApp ready');
                    window.Telegram.WebApp.ready?.();
                  }
                };
                
                script.onerror = (e) => {
                  console.error('✗ SDK load error:', e);
                };
                
                document.head.appendChild(script);
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-deep font-body text-foam antialiased">
        {children}
      </body>
    </html>
  );
}
