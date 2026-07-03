import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock only the Supabase server client that user.ts imports, so getUserProfile
// has no real dependency. We drive getUserProfile's result by controlling what
// the mocked client's query chain returns.

const maybeSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-123" } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle,
        })),
      })),
    })),
  })),
}));

// ensure-profile is imported by user.ts; stub it so a missing profile doesn't
// try to heal via RPC during these unit tests.
vi.mock("@/lib/auth/ensure-profile", () => ({
  ensureProfile: vi.fn(async () => ({
    id: "user-123",
    role: "user",
    tier: "free",
    display_name: null,
  })),
}));

import { getUserTier } from "@/lib/auth/user";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserTier", () => {
  it("returns 'free' for a free-tier profile", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "user-123", role: "user", tier: "free" },
      error: null,
    });
    await expect(getUserTier()).resolves.toBe("free");
  });

  it("returns 'paid' for a paid-tier profile", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "user-123", role: "user", tier: "paid" },
      error: null,
    });
    await expect(getUserTier()).resolves.toBe("paid");
  });

  it("returns 'enterprise' for an enterprise-tier profile", async () => {
    maybeSingle.mockResolvedValue({
      data: { id: "user-123", role: "user", tier: "enterprise" },
      error: null,
    });
    await expect(getUserTier()).resolves.toBe("enterprise");
  });
});
