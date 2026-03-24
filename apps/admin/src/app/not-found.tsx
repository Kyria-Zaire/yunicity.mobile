export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-[#2A2FFF]">404</h1>
      <p className="mt-4 text-lg text-[#9CA3AF]">Page introuvable</p>
      <a
        href="/"
        className="mt-6 px-6 py-2 rounded-lg bg-[#2A2FFF] text-white hover:bg-[#1A1ECC] transition-colors"
      >
        Retour au dashboard
      </a>
    </div>
  );
}
