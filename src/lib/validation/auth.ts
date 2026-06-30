import { z } from "zod";

/**
 * Reusable field schemas.
 */

// Email: validated, trimmed, lowercased (so "Foo@X.com " == "foo@x.com").
export const emailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .toLowerCase();

// Password for NEW passwords (signup, reset): enforce strength.
// Must be >= the Supabase minimum_password_length in config.toml (currently 6);
// we require 8. Capped at 72 because bcrypt silently truncates beyond 72 bytes.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.");

/**
 * Signup: email + password (+ confirmation), optional display name.
 * The display name, if given, flows into auth metadata and is picked up by the
 * handle_new_user trigger to seed profiles.display_name.
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: z
      .string()
      .trim()
      .min(1, "Display name is required.")
      .max(80, "Display name is too long.")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Login: email + password. The password is validated only as NON-EMPTY here,
 * NOT against the strength rules -- see note in the step explanation.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Password reset request: just the email to send the reset link to.
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;

/**
 * Password reset confirm: the new password (+ confirmation).
 */
export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type PasswordResetConfirmInput = z.infer<
  typeof passwordResetConfirmSchema
>;