/**
 * Access level required by a piece of content (course, lesson, resource).
 * Content is never "visitor" - the lowest it can require is "free".
 */
export type AccessLevel = "free" | "paid" | "enterprise";

/**
 * Tier of a user/visitor. Adds "visitor" for anonymous (logged-out) users,
 * who have no account. Compared against a content item's AccessLevel to
 * decide entitlement.
 */
export type UserTier = "visitor" | "free" | "paid" | "enterprise";

/**
 * Permission role, orthogonal to tier. Governs admin access, not content access.
 * A user can be any combination of UserTier and UserRole.
 */
export type UserRole = "user" | "admin";