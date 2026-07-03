// Barrel file for shared application types.

// App-specific union types (AccessLevel, UserTier, UserRole).
export * from "./access";
export * from "./content";

// Re-export the type helpers the Supabase CLI generates in database.ts,
// so the rest of the app can import them from "@/types".
// (Tables<"profiles">, TablesInsert<"course">, TablesUpdate<...>, Enums<...>)
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./database";