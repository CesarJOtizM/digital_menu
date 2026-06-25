import { redirect } from "next/navigation";
import { auth, signIn } from "@/shared/infrastructure/auth";

export const metadata = {
  title: "Sign in",
};

async function signInWithGoogle() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-medium">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Only allowlisted accounts can manage the menu.
        </p>

        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
