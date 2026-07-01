import { buttonVariants } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Renders a "Log out" button. It's a server-component form whose submit
 * invokes the logout server action -- no client JS required. Styled to match
 * the nav's other buttons via buttonVariants.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Log out
      </button>
    </form>
  );
}
