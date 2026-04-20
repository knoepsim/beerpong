"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CupGridProps {
  initialCount?: number;
  maxCups?: number;
  onChange?: (remainingCount: number) => void;
  color?: "red" | "blue";
  interactive?: boolean;
}

export function CupGrid({
  initialCount = 10,
  maxCups = 10,
  onChange,
  color = "red",
  interactive = true,
}: CupGridProps) {
  // Wir speichern welche Becher noch da sind (index-basiert)
  const [activeCups, setActiveCups] = useState<Set<number>>(new Set());

  useEffect(() => {
    const initial = new Set<number>();
    for (let i = 0; i < initialCount; i++) {
      initial.add(i);
    }
    setActiveCups(initial);
  }, [initialCount]);

  const toggleCup = (index: number) => {
    if (!interactive) return;

    const newActive = new Set(activeCups);
    if (newActive.has(index)) {
      newActive.delete(index);
    } else {
      newActive.add(index);
    }
    setActiveCups(newActive);
    onChange?.(newActive.size);
  };

  // Layout für 10 Becher (Dreieck)
  // Row 1: 4
  // Row 2: 3
  // Row 3: 2
  // Row 4: 1
  const rows = [
    [0, 1, 2, 3],
    [4, 5, 6],
    [7, 8],
    [9]
  ];

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((cupIndex) => (
            <div
              key={cupIndex}
              onClick={() => toggleCup(cupIndex)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer flex items-center justify-center relative shadow-sm",
                activeCups.has(cupIndex)
                  ? color === "red"
                    ? "bg-red-500 border-red-700 shadow-red-200"
                    : "bg-blue-500 border-blue-700 shadow-blue-200"
                  : "bg-zinc-100 border-zinc-300 opacity-20 scale-90",
                !interactive && "cursor-default"
              )}
            >
              {/* Becher-Innere (Visualisierung) */}
              <div className={cn(
                "w-7 h-7 rounded-full border border-white/20",
                activeCups.has(cupIndex) ? "opacity-100" : "opacity-0"
              )} />
            </div>
          ))}
        </div>
      ))}
      <div className="mt-4 text-lg font-bold">
        {activeCups.size} Becher übrig
      </div>
    </div>
  );
}
