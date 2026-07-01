import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata = {
  title: "Set a new password",
};

export default async function UpdatePasswordPage() {
  // The recovery link (via /auth/confirm) establishes a session before
  // redirecting here. If there's no user, the link was invalid or expired.
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Invalid or expired link
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is no longer valid. Please request a new one.
        </p>
        <div className="mt-6">
          <Link
            href="/reset-password"
            className="text-sm text-accent hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <UpdatePasswordForm />
    </div>
  );
}
