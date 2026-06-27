import { redirect } from "next/navigation";
import {
  getAuthUser,
  isDevBypassAvailable,
  signInWithDevBypassAction,
  signInWithGoogleAction,
  signInWithPasswordAction,
} from "@/shared/infrastructure/auth";

export const metadata = {
  title: "Iniciar sesión",
};

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "Tu cuenta no está autorizada para acceder al panel. Contacta al administrador.",
  invalid_credentials: "Correo o contraseña incorrectos.",
  missing_credentials: "Ingresa tu correo y contraseña.",
  oauth_start: "No se pudo iniciar el inicio de sesión con Google.",
  auth_callback: "No se pudo completar el inicio de sesión. Intenta de nuevo.",
  session_required: "Debes iniciar sesión para acceder al panel.",
};

function resolveLoginError(error: string | undefined): string | null {
  if (!error) return null;
  return ERROR_MESSAGES[error] ?? "Ocurrió un error al iniciar sesión.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getAuthUser();
  if (user) {
    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const errorMessage = resolveLoginError(error);
  const devBypassAvailable = isDevBypassAvailable();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Acceso administrador</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Solo cuentas autorizadas pueden gestionar la carta.
          </p>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        {devBypassAvailable ? (
          <form action={signInWithDevBypassAction} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              Entrar en modo desarrollo (bypass)
            </button>
            <p className="mt-2 text-xs text-amber-700">
              Solo local. No requiere Supabase ni Google.
            </p>
          </form>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Continuar con Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">o con correo</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>

        <form action={signInWithPasswordAction} className="space-y-4">
          <div className="space-y-1 text-left">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
