"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types";
import type { CourseAssetFlag } from "@/types/content";

type Track = Tables<"tracks">;

const ALL = "all";

const ACCESS_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
];

const CATEGORY_OPTIONS = [
  { value: "LEARN", label: "Learn" },
  { value: "PROJ", label: "Project" },
  { value: "AUTO", label: "Automation" },
  { value: "CAREER", label: "Career" },
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const ASSET_FLAGS: { param: CourseAssetFlag; label: string }[] = [
  { param: "has_scaffold", label: "Scaffold" },
  { param: "has_gist", label: "Gist" },
  { param: "has_sandbox", label: "Sandbox" },
  { param: "has_local_mirror", label: "Local mirror" },
];

interface CatalogFiltersProps {
  tracks: Track[];
}

/**
 * Catalog filter bar. All state lives in the URL (?access=&category=&track=
 * &level=&has_scaffold=1&lab=active), read via useSearchParams and updated via
 * router.push while PRESERVING other params -- so facets combine and every
 * filtered view is shareable/bookmarkable. This is a Client Component; the
 * catalog page (server) reads the same params to fetch.
 */
export function CatalogFilters({ tracks }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Merge a set of param changes into the current URL. A null/empty value
  // removes the param. Always resets to the base path (no page param yet).
  const setParams = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      router.push(qs ? `/catalog?${qs}` : "/catalog");
    },
    [router, searchParams],
  );

  // Single-select facet: value or "all" (which clears the param). Base UI's
  // onValueChange passes `string | null`, so accept that and coalesce.
  const selectValue = (param: string) => searchParams.get(param) ?? ALL;
  const onSelect = (param: string) => (value: string | null) => {
    setParams({ [param]: !value || value === ALL ? null : value });
  };

  // Boolean facet: present ("1") vs absent.
  const isChecked = (param: string) => searchParams.get(param) === "1";
  const onToggle = (param: string) => (checked: boolean) => {
    setParams({ [param]: checked ? "1" : null });
  };

  const hasAnyFilter = [
    "access",
    "category",
    "track",
    "level",
    "lab",
    ...ASSET_FLAGS.map((f) => f.param),
  ].some((p) => searchParams.get(p));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Access */}
        <FilterSelect
          label="Access"
          value={selectValue("access")}
          onValueChange={onSelect("access")}
          placeholder="Any access"
          options={ACCESS_OPTIONS}
        />

        {/* Category */}
        <FilterSelect
          label="Category"
          value={selectValue("category")}
          onValueChange={onSelect("category")}
          placeholder="Any category"
          options={CATEGORY_OPTIONS}
        />

        {/* Track */}
        <FilterSelect
          label="Track"
          value={selectValue("track")}
          onValueChange={onSelect("track")}
          placeholder="Any track"
          options={tracks.map((t) => ({ value: t.slug, label: t.title }))}
        />

        {/* Level */}
        <FilterSelect
          label="Level"
          value={selectValue("level")}
          onValueChange={onSelect("level")}
          placeholder="Any level"
          options={LEVEL_OPTIONS}
        />

        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => router.push("/catalog")}
            className="h-8 self-end px-2 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Asset flags (combinable) + validation lab */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-sm text-muted-foreground">Deliverables:</span>
        {ASSET_FLAGS.map((flag) => (
          <label
            key={flag.param}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <Checkbox
              checked={isChecked(flag.param)}
              onCheckedChange={onToggle(flag.param)}
            />
            {flag.label}
          </label>
        ))}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Checkbox
            checked={searchParams.get("lab") === "active"}
            onCheckedChange={(checked: boolean) =>
              setParams({ lab: checked ? "active" : null })
            }
          />
          Validation lab
        </label>
      </div>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

function FilterSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="min-w-40">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
