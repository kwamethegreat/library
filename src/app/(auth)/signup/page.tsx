import Link from "next/link";

import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start learning in minutes.
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}