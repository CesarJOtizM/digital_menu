import { auth, signOut } from "@/shared/infrastructure/auth";

export const metadata = {
  title: "Dashboard",
};

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function DashboardPage() {
  // Middleware already guards /dashboard; auth() exposes the session for UI.
  const session = await auth();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
          >
            Sign out
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        Signed in as {session?.user?.email ?? "admin"}.
      </p>
    </main>
  );
}
