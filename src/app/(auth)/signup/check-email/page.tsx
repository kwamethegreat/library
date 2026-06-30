import Link from "next/link";

export const metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <div className="text-center">
      {/* Mail icon mark */}
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <h1 className="text-xl font-semibold text-foreground">
        Check your email
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ve sent you a confirmation link. Click it to activate your
        account, then sign in.
      </p>

      <p className="mt-4 text-xs text-muted-foreground">
        Didn&apos;t get it? Check your spam folder, or wait a moment and try
        signing up again.
      </p>

      <div className="mt-6">
        <Link
          href="/login"
          className="text-sm text-accent hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}