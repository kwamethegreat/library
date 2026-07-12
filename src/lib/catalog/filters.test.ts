import { describe, expect, it } from "vitest";

import {
  CATALOG_PAGE_SIZE,
  MIN_SEARCH_LENGTH,
  hasActiveCatalogFilters,
  parseCatalogFilters,
  parseCatalogPage,
} from "@/lib/catalog/filters";

/**
 * These are pure functions -- no Supabase, no network, no mocks needed. They
 * are the trust boundary between a user-controlled URL and our DB query, so the
 * tests lean on the hostile cases: hand-edited params, bogus enums, junk pages.
 */

describe("parseCatalogFilters", () => {
  it("returns an all-empty state for no params", () => {
    const state = parseCatalogFilters({});
    expect(state).toEqual({
      track: undefined,
      level: undefined,
      access: undefined,
      category: undefined,
      hasScaffold: false,
      hasGist: false,
      hasSandbox: false,
      hasLocalMirror: false,
      labActive: false,
      search: undefined,
    });
  });

  it("parses every valid facet", () => {
    const state = parseCatalogFilters({
      track: "frontend",
      level: "advanced",
      access: "paid",
      category: "PROJ",
      has_scaffold: "1",
      has_gist: "1",
      has_sandbox: "1",
      has_local_mirror: "1",
      lab: "active",
      q: "react",
    });
    expect(state).toEqual({
      track: "frontend",
      level: "advanced",
      access: "paid",
      category: "PROJ",
      hasScaffold: true,
      hasGist: true,
      hasSandbox: true,
      hasLocalMirror: true,
      labActive: true,
      search: "react",
    });
  });

  it("accepts a URLSearchParams as well as a plain object", () => {
    const params = new URLSearchParams({ level: "beginner", q: "postgres" });
    const state = parseCatalogFilters(params);
    expect(state.level).toBe("beginner");
    expect(state.search).toBe("postgres");
  });

  it("takes the first value when a param is repeated", () => {
    const state = parseCatalogFilters({ level: ["beginner", "advanced"] });
    expect(state.level).toBe("beginner");
  });

  describe("enum validation (hand-edited URLs must not reach the DB)", () => {
    it("drops an invalid level", () => {
      expect(parseCatalogFilters({ level: "banana" }).level).toBeUndefined();
    });

    it("drops an invalid access level", () => {
      expect(parseCatalogFilters({ access: "freemium" }).access).toBeUndefined();
    });

    it("drops an invalid category", () => {
      expect(parseCatalogFilters({ category: "learn" }).category).toBeUndefined();
    });

    it.each(["beginner", "intermediate", "advanced"] as const)(
      "keeps valid level %s",
      (level) => {
        expect(parseCatalogFilters({ level }).level).toBe(level);
      },
    );

    it.each(["free", "paid", "enterprise"] as const)(
      "keeps valid access %s",
      (access) => {
        expect(parseCatalogFilters({ access }).access).toBe(access);
      },
    );

    it.each(["LEARN", "PROJ", "AUTO", "CAREER"] as const)(
      "keeps valid category %s",
      (category) => {
        expect(parseCatalogFilters({ category }).category).toBe(category);
      },
    );
  });

  describe("boolean flags only narrow when explicitly '1'", () => {
    it.each(["0", "false", "true", "yes", ""])(
      "treats has_scaffold=%s as not filtering",
      (value) => {
        expect(parseCatalogFilters({ has_scaffold: value }).hasScaffold).toBe(
          false,
        );
      },
    );

    it("treats lab=active as the only truthy lab value", () => {
      expect(parseCatalogFilters({ lab: "active" }).labActive).toBe(true);
      expect(parseCatalogFilters({ lab: "draft" }).labActive).toBe(false);
      expect(parseCatalogFilters({ lab: "1" }).labActive).toBe(false);
    });
  });

  describe("search minimum length (item 104)", () => {
    it("has a two-character floor", () => {
      // Guards the decision itself: 2 chars, NOT 3 -- "go"/"js"/"ai" are real
      // technical search terms and must remain searchable.
      expect(MIN_SEARCH_LENGTH).toBe(2);
    });

    it("drops a one-character term", () => {
      expect(parseCatalogFilters({ q: "r" }).search).toBeUndefined();
    });

    it("drops a term that is only whitespace", () => {
      expect(parseCatalogFilters({ q: "   " }).search).toBeUndefined();
    });

    it("drops an empty term", () => {
      expect(parseCatalogFilters({ q: "" }).search).toBeUndefined();
    });

    it("keeps a two-character term", () => {
      expect(parseCatalogFilters({ q: "go" }).search).toBe("go");
    });

    it("trims before measuring, and stores the trimmed value", () => {
      expect(parseCatalogFilters({ q: "  react  " }).search).toBe("react");
      // " a " trims to "a" -> one char -> dropped.
      expect(parseCatalogFilters({ q: " a " }).search).toBeUndefined();
    });
  });
});

describe("parseCatalogPage", () => {
  it("defaults to page 1 when absent", () => {
    expect(parseCatalogPage({})).toBe(1);
  });

  it("parses a valid page", () => {
    expect(parseCatalogPage({ page: "3" })).toBe(3);
  });

  it.each(["0", "-1", "abc", "", "NaN"])(
    "collapses invalid page %s to 1",
    (page) => {
      expect(parseCatalogPage({ page })).toBe(1);
    },
  );

  it("reads from URLSearchParams too", () => {
    expect(parseCatalogPage(new URLSearchParams({ page: "4" }))).toBe(4);
  });

  it("accepts a large page (the upper bound is enforced at fetch time)", () => {
    // parseCatalogPage deliberately does NOT clamp the top end -- it can't know
    // how many pages exist. The fetcher + page redirect handle the overshoot.
    expect(parseCatalogPage({ page: "999" })).toBe(999);
  });
});

describe("hasActiveCatalogFilters", () => {
  const empty = parseCatalogFilters({});

  it("is false for an empty state", () => {
    expect(hasActiveCatalogFilters(empty)).toBe(false);
  });

  it.each([
    ["track", { track: "frontend" }],
    ["level", { level: "beginner" }],
    ["access", { access: "paid" }],
    ["category", { category: "LEARN" }],
    ["has_scaffold", { has_scaffold: "1" }],
    ["has_gist", { has_gist: "1" }],
    ["has_sandbox", { has_sandbox: "1" }],
    ["has_local_mirror", { has_local_mirror: "1" }],
    ["lab", { lab: "active" }],
    ["q", { q: "react" }],
  ])("is true when only %s is set", (_name, params) => {
    expect(hasActiveCatalogFilters(parseCatalogFilters(params))).toBe(true);
  });

  it("is NOT made active by pagination alone", () => {
    // page is a view offset, not a filter -- browsing to page 2 must not make
    // the UI think filters are applied (e.g. showing a "Clear filters" state).
    expect(hasActiveCatalogFilters(parseCatalogFilters({ page: "2" }))).toBe(
      false,
    );
  });

  it("is NOT made active by a too-short search", () => {
    expect(hasActiveCatalogFilters(parseCatalogFilters({ q: "a" }))).toBe(false);
  });
});

describe("CATALOG_PAGE_SIZE", () => {
  it("is a positive integer", () => {
    expect(Number.isInteger(CATALOG_PAGE_SIZE)).toBe(true);
    expect(CATALOG_PAGE_SIZE).toBeGreaterThan(0);
  });
});
