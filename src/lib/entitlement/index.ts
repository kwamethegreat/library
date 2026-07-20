// Barrel for the entitlement model.
//
// Import from "@/lib/entitlement" rather than the individual modules, so the
// internal file layout can change without touching call sites.
//
// NOTE: viewer.ts is server-only (it imports "server-only"), so importing this
// barrel from a Client Component will fail the build by design -- entitlement
// is computed on the server, never in the browser.

export * from "./types";
export * from "./rules";
export * from "./viewer";
