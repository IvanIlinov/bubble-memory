"use client";

import Link from "next/link";
import type { Route } from "next";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-deep px-4 py-6 text-foam">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center gap-3">
          <Link
            href={"/" as Route}
            className="text-foam-muted hover:text-foam transition-colors"
          >
            назад
          </Link>
          <h1 className="font-display text-lg text-foam">Профиль</h1>
        </header>

        <div className="rounded-2xl bg-deep-panel p-6 text-center text-foam-muted ring-1 ring-white/10">
          <p>Профиль в разработке</p>
        </div>
      </div>
    </main>
  );
}
