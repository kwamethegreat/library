"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { setOnboardingLaneAction } from "./actions";

type Lane = "student" | "professional" | "enterprise";

const LANES: { value: Lane; title: string; description: string }[] = [
  {
    value: "student",
    title: "Student",
    description: "Learning the fundamentals and building a foundation.",
  },
  {
    value: "professional",
    title: "Professional",
    description: "Leveling up practical skills for your day-to-day work.",
  },
  {
    value: "enterprise",
    title: "Enterprise",
    description: "Advanced material and team-oriented learning paths.",
  },
];

export function LaneSelector() {
  const [selected, setSelected] = useState<Lane | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await setOnboardingLaneAction({ lane: selected });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {LANES.map((lane) => {
          const isActive = selected === lane.value;
          return (
            <button
              key={lane.value}
              type="button"
              onClick={() => setSelected(lane.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                isActive
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface hover:border-muted-foreground",
              )}
            >
              <div className="font-medium text-foreground">{lane.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {lane.description}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={handleContinue}
        disabled={!selected || isPending}
      >
        {isPending ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
