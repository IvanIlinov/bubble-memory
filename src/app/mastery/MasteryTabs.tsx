"use client";

import { useState } from "react";
import { MasteryTasksList } from "./MasteryTasksList";
import { MasteryHistory } from "./MasteryHistory";

export function MasteryTabs() {
  const [activeTab, setActiveTab] = useState<"tasks" | "history">("tasks");

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-2 rounded-lg bg-white/5 p-1 ring-1 ring-white/10">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "tasks"
              ? "bg-white/10 text-foam ring-1 ring-white/20"
              : "text-foam-muted hover:text-foam"
          }`}
        >
          Задания
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === "history"
              ? "bg-white/10 text-foam ring-1 ring-white/20"
              : "text-foam-muted hover:text-foam"
          }`}
        >
          История
        </button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "tasks" && <MasteryTasksList />}
        {activeTab === "history" && <MasteryHistory />}
      </div>
    </div>
  );
}
