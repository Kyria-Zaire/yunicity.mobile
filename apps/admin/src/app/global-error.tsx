'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-[#DC2626]">500</h1>
          <p className="mt-4 text-lg text-[#9CA3AF]">Erreur interne</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 px-6 py-2 rounded-lg bg-[#2A2FFF] text-white hover:bg-[#1A1ECC] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
