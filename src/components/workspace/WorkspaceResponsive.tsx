"use client";

import { Code2, FileText } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PaneKey = "lesson" | "code";

interface WorkspaceResponsiveProps {
  /** Theory/media pane (server-rendered; passed through, rendered ONCE). */
  lesson: ReactNode;
  /** Code/terminal pane (server-rendered; passed through, rendered ONCE). */
  code: ReactNode;
}

const TABS: { key: PaneKey; label: string; Icon: typeof FileText }[] = [
  { key: "lesson", label: "Lesson", Icon: FileText },
  { key: "code", label: "Code", Icon: Code2 },
];

/**
 * Responsive body of the lesson workspace (item 121).
 *
 *   - below lg : Lesson | Code tab switcher (per 1B/2C -- terminal stays inside
 *                the Code pane, so two tabs).
 *   - lg+      : side-by-side split, 45% theory | 55% code, no tab strip.
 *
 * VISIBILITY STRATEGY (learned the hard way): we do NOT use the `hidden`
 * attribute. Tailwind Preflight hides `[hidden]` with a base-layer `!important`
 * that utilities can't cleanly override, and Base UI Tabs additionally unmounts
 * / marks panels `inert`. All of that fought the lg+ split.
 *
 * Instead each panel is ALWAYS in normal flow, and below lg the INACTIVE panel
 * is hidden with a plain `hidden` (display:none) UTILITY class that we toggle
 * ourselves -- reset to visible at lg via `lg:!flex`. No `hidden` attribute, so
 * Preflight has nothing to grab; at lg both panels are real flex children with
 * natural height. Panes render once, stay interactive (no inert).
 *
 * Accessibility (also serves item 122): tablist/tab/tabpanel roles,
 * aria-selected, roving tabindex, Left/Right/Home/End key nav.
 *
 * CLIENT BOUNDARY: owns only which tab is active; pane CONTENTS are
 * server-rendered nodes passed through, so no lesson content ships as client JS.
 */
export function WorkspaceResponsive({ lesson, code }: WorkspaceResponsiveProps) {
  const [active, setActive] = useState<PaneKey>("lesson");
  const baseId = useId();
  const tabRefs = useRef<Record<PaneKey, HTMLButtonElement | null>>({
    lesson: null,
    code: null,
  });

  const tabId = (key: PaneKey) => `${baseId}-tab-${key}`;
  const panelId = (key: PaneKey) => `${baseId}-panel-${key}`;

  const onTabKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const order: PaneKey[] = TABS.map((t) => t.key);
    const currentIndex = order.indexOf(
      (event.currentTarget.dataset.key as PaneKey) ?? "lesson",
    );
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % order.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + order.length) % order.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = order.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextKey = order[nextIndex];
    if (nextKey) {
      setActive(nextKey);
      tabRefs.current[nextKey]?.focus();
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab strip: below lg only. */}
      <div
        role="tablist"
        aria-label="Lesson views"
        aria-orientation="horizontal"
        className="m-3 inline-flex w-fit items-center gap-1 self-start rounded-lg bg-muted p-[3px] lg:hidden"
      >
        {TABS.map(({ key, label, Icon }) => {
          const selected = active === key;
          return (
            <button
              key={key}
              ref={(node) => {
                tabRefs.current[key] = node;
              }}
              type="button"
              role="tab"
              id={tabId(key)}
              data-key={key}
              aria-selected={selected}
              aria-controls={panelId(key)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(key)}
              onKeyDown={onTabKeyDown}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Panels: column below lg; 45/55 row at lg+. Each rendered ONCE.
          Inactive panel below lg gets `hidden` (the CLASS, display:none), reset
          to flex at lg via lg:!flex -- no `hidden` ATTRIBUTE anywhere. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          role="tabpanel"
          id={panelId("lesson")}
          aria-labelledby={tabId("lesson")}
          className={cn(
            "min-h-0 flex-col overflow-y-auto lg:!flex lg:w-[45%] lg:border-r lg:border-border",
            active === "lesson" ? "flex" : "hidden",
          )}
        >
          <section aria-label="Lesson theory and media">{lesson}</section>
        </div>

        <div
          role="tabpanel"
          id={panelId("code")}
          aria-labelledby={tabId("code")}
          className={cn(
            "min-h-0 flex-col overflow-y-auto bg-surface lg:!flex lg:w-[55%]",
            active === "code" ? "flex" : "hidden",
          )}
        >
          <section aria-label="Lesson code and workspace">{code}</section>
        </div>
      </div>
    </div>
  );
}
