'use client';

const MOCK_POSTS = [
  {
    id: '1',
    content: 'Visitez mon site xxx.com !',
    score: 0.85,
    author: 'user123',
    tribu: 'Dev Reims',
    date: 'il y a 2h',
  },
  {
    id: '2',
    content: 'SPAM SPAM ACHETEZ MAINTENANT',
    score: 0.98,
    author: 'user456',
    tribu: 'Mur public',
    date: 'il y a 1h',
  },
];

export default function ModerationPage() {
  return (
    <div>
      <h1 className="font-display text-[28px] font-bold text-white tracking-tight">
        Modération
      </h1>
      <p className="font-body text-sm text-[#6B7280] mt-1">
        Queue des posts signalés
      </p>

      <div className="mt-8 space-y-4">
        {MOCK_POSTS.map((p) => {
          const isHigh = p.score > 0.9;
          const isMedium = p.score > 0.5 && !isHigh;
          const contentCls = isHigh
            ? 'text-[#DC2626]'
            : isMedium
              ? 'text-[#D97706]'
              : 'text-white';
          const barCls = isHigh
            ? 'bg-[#DC2626]'
            : isMedium
              ? 'bg-[#D97706]'
              : 'bg-[#6B7280]';

          return (
            <div
              key={p.id}
              className="rounded-2xl border border-[#1C1F4A] bg-[#1C1F4A]/40 p-5"
            >
              <p className={`font-body text-[15px] ${contentCls}`}>
                {p.content}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 max-w-[200px]">
                  <div className="h-2 bg-[#0D0F2E] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barCls}`}
                      style={{ width: `${p.score * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    Score : {(p.score * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#9395FF]">
                  {p.author} · {p.tribu} · {p.date}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#16A34A] text-white font-mono text-[11px] font-semibold"
                >
                  ✅ Approuver
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-[#DC2626] text-white font-mono text-[11px] font-semibold"
                >
                  ❌ Supprimer
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[#1C1F4A] text-[#9395FF] font-mono text-[11px] hover:bg-[#1C1F4A]"
                >
                  👁 Voir le contexte
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
