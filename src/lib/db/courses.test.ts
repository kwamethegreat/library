import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPublishedCourses } from "@/lib/db/courses";
import { createClient } from "@/lib/supabase/server";

// Mock the RLS-respecting server client: these are unit tests, so no network,
// no cookies, no DB. We assert on the QUERY WE BUILD, not on Postgres.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const mockCreateClient = vi.mocked(createClient);

/** One recorded call: the argument list a builder method was invoked with. */
type RecordedCall = readonly unknown[];

/** Every call made on a single query builder, grouped by method. */
interface QueryCalls {
  select: RecordedCall[];
  eq: RecordedCall[];
  textSearch: RecordedCall[];
  order: RecordedCall[];
  range: RecordedCall[];
}

/** What a mocked query resolves to (the shape Supabase returns). */
interface QueryResult {
  data?: unknown[] | null;
  error?: { code: string; message: string } | null;
  count?: number | null;
}

interface ResolvedResult {
  data: unknown[] | null;
  error: { code: string; message: string } | null;
  count: number | null;
}

/**
 * A chainable stand-in for the Supabase query builder: every method returns the
 * builder (like the real one), and the builder is thenable -- so `await query`
 * inside getPublishedCourses resolves to the result we queued.
 *
 * Deliberately typed end-to-end (no `any`): the codebase bans unsafe types, and
 * a mock is no excuse to smuggle them in.
 */
interface QueryBuilderMock {
  select: (...args: unknown[]) => QueryBuilderMock;
  eq: (...args: unknown[]) => QueryBuilderMock;
  textSearch: (...args: unknown[]) => QueryBuilderMock;
  order: (...args: unknown[]) => QueryBuilderMock;
  range: (...args: unknown[]) => QueryBuilderMock;
  then: <TResult>(
    resolve: (value: ResolvedResult) => TResult,
  ) => Promise<TResult>;
}

function createQueryBuilder(result: QueryResult): {
  builder: QueryBuilderMock;
  calls: QueryCalls;
} {
  const calls: QueryCalls = {
    select: [],
    eq: [],
    textSearch: [],
    order: [],
    range: [],
  };

  const resolved: ResolvedResult = {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count ?? null,
  };

  const builder: QueryBuilderMock = {
    select: (...args) => {
      calls.select.push(args);
      return builder;
    },
    eq: (...args) => {
      calls.eq.push(args);
      return builder;
    },
    textSearch: (...args) => {
      calls.textSearch.push(args);
      return builder;
    },
    order: (...args) => {
      calls.order.push(args);
      return builder;
    },
    range: (...args) => {
      calls.range.push(args);
      return builder;
    },
    then: (resolve) => Promise.resolve(resolved).then(resolve),
  };

  return { builder, calls };
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Queue one builder per `.from()` call, and return their call records.
 *
 * getPublishedCourses calls from() once normally; on the range-past-end
 * fallback it calls it a second time (the count-only query), so some tests
 * queue two results.
 */
function mockSupabaseWith(...results: QueryResult[]): QueryCalls[] {
  const builders = results.map(createQueryBuilder);
  let index = 0;

  const from = (): QueryBuilderMock => {
    const next = builders[Math.min(index, builders.length - 1)];
    index += 1;
    if (!next) {
      throw new Error("mockSupabaseWith: no query builder queued");
    }
    return next.builder;
  };

  // A structural mock can't satisfy the full SupabaseClient type, and forcing
  // it to would teach us nothing -- cast once, here, and nowhere else.
  mockCreateClient.mockResolvedValue({
    from,
  } as unknown as SupabaseServerClient);

  return builders.map((entry) => entry.calls);
}

/** Safe indexed access (tsconfig has noUncheckedIndexedAccess). */
function callsAt(records: QueryCalls[], index: number): QueryCalls {
  const found = records[index];
  if (!found) {
    throw new Error(`no query builder recorded at index ${index}`);
  }
  return found;
}

/** The column each recorded eq() call filtered on. */
function eqColumns(calls: QueryCalls): unknown[] {
  return calls.eq.map((call) => call[0]);
}

/** A row shaped like the card columns the fetcher selects. */
function courseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "course-1",
    slug: "intro-to-react",
    title: "Intro to React",
    system_moat_identifier: "LEARN-001",
    code_asset_flag: true,
    validation_lab_status: "none",
    level: "beginner",
    access_level: "free",
    category: "LEARN",
    track_id: "track-1",
    has_scaffold: true,
    has_gist: true,
    has_sandbox: false,
    has_local_mirror: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPublishedCourses -- base query", () => {
  it("always restricts to published rows and asks for an exact count", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses();

    expect(calls.eq).toContainEqual(["published", true]);
    expect(calls.select[0]?.[1]).toEqual({ count: "exact" });
  });

  it("orders by sort_order ascending", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses();

    expect(calls.order).toContainEqual(["sort_order", { ascending: true }]);
  });

  it("maps rows to the narrowed card shape", async () => {
    mockSupabaseWith({ data: [courseRow()], count: 1 });

    const { courses, total } = await getPublishedCourses();

    expect(total).toBe(1);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({
      slug: "intro-to-react",
      level: "beginner",
      access_level: "free",
      category: "LEARN",
    });
  });

  it("throws on a real query error", async () => {
    mockSupabaseWith({
      error: { code: "42P01", message: "relation does not exist" },
    });

    await expect(getPublishedCourses()).rejects.toThrow(
      "Failed to fetch courses",
    );
  });
});

describe("getPublishedCourses -- filtering", () => {
  it("applies each provided facet as an equality filter", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({
      trackId: "track-1",
      level: "advanced",
      accessLevel: "paid",
      category: "PROJ",
    });

    expect(calls.eq).toContainEqual(["track_id", "track-1"]);
    expect(calls.eq).toContainEqual(["level", "advanced"]);
    expect(calls.eq).toContainEqual(["access_level", "paid"]);
    expect(calls.eq).toContainEqual(["category", "PROJ"]);
  });

  it("omits facets that were not provided", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({ level: "beginner" });

    const columns = eqColumns(calls);
    expect(columns).toContain("level");
    expect(columns).not.toContain("access_level");
    expect(columns).not.toContain("category");
    expect(columns).not.toContain("track_id");
  });

  it("asset flags NARROW when true", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({ hasScaffold: true, hasSandbox: true });

    expect(calls.eq).toContainEqual(["has_scaffold", true]);
    expect(calls.eq).toContainEqual(["has_sandbox", true]);
  });

  it("asset flags DO NOT filter when false (false means 'don't care')", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({
      hasScaffold: false,
      hasGist: false,
      hasSandbox: false,
      hasLocalMirror: false,
      labActive: false,
    });

    const columns = eqColumns(calls);
    expect(columns).not.toContain("has_scaffold");
    expect(columns).not.toContain("has_gist");
    expect(columns).not.toContain("has_sandbox");
    expect(columns).not.toContain("has_local_mirror");
    expect(columns).not.toContain("validation_lab_status");
  });

  it("labActive maps to validation_lab_status = active", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({ labActive: true });

    expect(calls.eq).toContainEqual(["validation_lab_status", "active"]);
  });
});

describe("getPublishedCourses -- search", () => {
  it("runs a websearch full-text query against search_vector", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({ search: "react" });

    expect(calls.textSearch).toContainEqual([
      "search_vector",
      "react",
      { type: "websearch", config: "english" },
    ]);
  });

  it("does not search when no term is given", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({});

    expect(calls.textSearch).toHaveLength(0);
  });

  it("does not search on a whitespace-only term", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({ search: "   " });

    expect(calls.textSearch).toHaveLength(0);
  });
});

describe("getPublishedCourses -- pagination", () => {
  it("does not range when no pagination is requested", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({});

    expect(calls.range).toHaveLength(0);
  });

  it("converts page 1 to range(0, size-1)", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({}, { page: 1, pageSize: 12 });

    expect(calls.range).toContainEqual([0, 11]);
  });

  it("converts page 3 to the correct zero-based offset", async () => {
    const calls = callsAt(mockSupabaseWith({ data: [], count: 0 }), 0);

    await getPublishedCourses({}, { page: 3, pageSize: 12 });

    expect(calls.range).toContainEqual([24, 35]);
  });

  it("returns the total count alongside the page slice", async () => {
    mockSupabaseWith({ data: [courseRow()], count: 37 });

    const { courses, total } = await getPublishedCourses(
      {},
      { page: 1, pageSize: 12 },
    );

    expect(courses).toHaveLength(1);
    expect(total).toBe(37);
  });

  /**
   * REGRESSION (item 105): PostgREST returns 416 / PGRST103 when the range
   * starts past the end of the result set -- e.g. ?page=2 with only 3 matches.
   * That must NOT surface as an error; it must come back as an empty page with
   * the TRUE total, so the catalog page can redirect to the last real page.
   */
  describe("range past the end (PGRST103)", () => {
    const rangeError = {
      code: "PGRST103",
      message: "Requested range not satisfiable",
    };

    it("returns an empty page plus the true total instead of throwing", async () => {
      // 1st from(): the paged query 416s. 2nd from(): the count-only fallback.
      mockSupabaseWith({ error: rangeError }, { count: 3 });

      const { courses, total } = await getPublishedCourses(
        {},
        { page: 2, pageSize: 12 },
      );

      expect(courses).toEqual([]);
      expect(total).toBe(3);
    });

    it("counts with head:true so the fallback fetches no rows", async () => {
      const records = mockSupabaseWith({ error: rangeError }, { count: 3 });

      await getPublishedCourses({}, { page: 2, pageSize: 12 });

      const countCalls = callsAt(records, 1);
      expect(countCalls.select[0]?.[1]).toEqual({
        count: "exact",
        head: true,
      });
    });

    it("applies the SAME filters to the fallback count", async () => {
      // If the count ignored filters it would report a bogus total and we'd
      // redirect to a page that doesn't exist for the current filter set.
      const records = mockSupabaseWith({ error: rangeError }, { count: 1 });

      await getPublishedCourses(
        { level: "advanced", search: "react" },
        { page: 5, pageSize: 12 },
      );

      const countCalls = callsAt(records, 1);
      expect(countCalls.eq).toContainEqual(["published", true]);
      expect(countCalls.eq).toContainEqual(["level", "advanced"]);
      expect(countCalls.textSearch).toContainEqual([
        "search_vector",
        "react",
        { type: "websearch", config: "english" },
      ]);
    });

    it("still throws PGRST103 when NO pagination was requested", async () => {
      // Without a range there is no legitimate way to get a 416 -- so if one
      // shows up, it's a real fault and must not be swallowed.
      mockSupabaseWith({ error: rangeError });

      await expect(getPublishedCourses({})).rejects.toThrow(
        "Failed to fetch courses",
      );
    });
  });
});
