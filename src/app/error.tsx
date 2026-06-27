"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  );
}
