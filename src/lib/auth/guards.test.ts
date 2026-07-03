import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock calls are hoisted above the imports by Vitest.

// Mock the Supabase clients so importing the guard chain never builds a real
// client (which would otherwise need real env/network at import time).
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ __mockAdminClient: true })),
}));

// Mock the user helpers the guards depend on, so we control auth state.
vi.mock("@/lib/auth/user", () => ({
  getCurrentUser: vi.fn(),
  getUserProfile: vi.fn(),
}));

// Mock next/navigation's redirect. The real redirect() THROWS to halt
// execution, so our mock throws too -- letting us assert that code after a
// redirect never runs.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { redirect } from "next/navigation";

import { requireAdmin, requireUser } from "@/lib/auth/guards";
import { getCurrentUser, getUserProfile } from "@/lib/auth/user";

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockGetUserProfile = vi.mocked(getUserProfile);
const mockRedirect = vi.mocked(redirect);

const fakeUser = { id: "user-123", email: "test@example.com" } as User;

function profileWith(overrides: Record<string, unknown>) {
  return {
    id: "user-123",
    role: "user",
    tier: "free",
    display_name: null,
    ...overrides,
  } as unknown as Awaited<ReturnType<typeof getUserProfile>>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("requireUser", () => {
  it("returns the user when authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(fakeUser);
    const user = await requireUser();
    expect(user).toBe(fakeUser);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to /login (no redirectTo) when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login with an encoded redirectTo when provided", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    await expect(requireUser("/dashboard/settings")).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mockRedirect).toHaveBeenCalledWith(
      "/login?redirectTo=%2Fdashboard%2Fsettings",
    );
  });
});

describe("requireAdmin", () => {
  it("redirects to /login when there is no profile (not signed in)", async () => {
    mockGetUserProfile.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login?redirectTo=/admin");
  });

  it("redirects to /dashboard when signed in but not an admin", async () => {
    mockGetUserProfile.mockResolvedValue(profileWith({ role: "user" }));
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns the profile and admin client for an admin", async () => {
    const adminProfile = profileWith({ role: "admin" });
    mockGetUserProfile.mockResolvedValue(adminProfile);
    const result = await requireAdmin();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result.profile).toBe(adminProfile);
    expect(result.admin).toEqual({ __mockAdminClient: true });
  });
});
