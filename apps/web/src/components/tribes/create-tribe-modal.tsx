'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { value: 'culture',   label: '🎭 Culture' },
  { value: 'sport',     label: '🚴 Sport' },
  { value: 'business',  label: '💼 Business' },
  { value: 'social',    label: '🤝 Social' },
  { value: 'ecology',   label: '🌱 Ecologie' },
  { value: 'food',      label: '🍕 Food' },
  { value: 'art',       label: '🎨 Art' },
  { value: 'tech',      label: '💻 Tech' },
  { value: 'education', label: '📚 Education' },
  { value: 'other',     label: '✨ Autre' },
] as const;

export function CreateTribeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'culture',
    city: 'reims',
    isPublic: true,
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (form.name.length < 3) {
      setError('Le nom doit faire au moins 3 caracteres');
      return;
    }
    if (form.description.length < 10) {
      setError('La description doit faire au moins 10 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000'}/community/tribes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(form),
        },
      );

      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        setError(data.message ?? 'Erreur lors de la creation');
        return;
      }

      const tribe = (await res.json()) as { id: string };
      router.push(`/tribus/${tribe.id}`);
      onClose();
    } catch {
      setError('Erreur reseau. Reessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          style={{ background: '#0D0F2E' }}
          className="px-6 py-5 flex items-center justify-between"
        >
          <div>
            <h2 className="font-display text-xl font-bold text-white">Creer une tribu</h2>
            <p className="text-[#9395FF] text-sm mt-0.5">Rassemble les passionnes de Reims</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl leading-none"
          >
            x
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Nom de la tribu *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="ex: Cyclistes de Reims"
              maxLength={50}
              className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] text-[#0D0F2E]
                         focus:border-[#2A2FFF] focus:outline-none focus:ring-2
                         focus:ring-[#2A2FFF]/10 text-sm transition-all"
            />
            <p className="text-xs text-[#9CA3AF] mt-1 text-right">{form.name.length}/50</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Categorie *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                  className={`h-10 px-3 rounded-xl text-sm font-medium transition-all text-left
                    ${
                      form.category === cat.value
                        ? 'bg-[#2A2FFF] text-white shadow-md'
                        : 'bg-[#F9FAFB] text-[#374151] hover:bg-[#E8E9FF] hover:text-[#2A2FFF]'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Description *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Decris ta tribu en quelques mots..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#0D0F2E] text-sm
                         focus:border-[#2A2FFF] focus:outline-none focus:ring-2
                         focus:ring-[#2A2FFF]/10 resize-none transition-all"
            />
            <p className="text-xs text-[#9CA3AF] mt-1 text-right">
              {form.description.length}/500
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Tags <span className="text-[#9CA3AF] font-normal">(max 5)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="velo, sport, reims..."
                className="flex-1 h-10 px-3 rounded-xl border border-[#E5E7EB] text-sm
                           focus:border-[#2A2FFF] focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="h-10 px-4 bg-[#F3F4F6] rounded-xl text-sm font-medium
                           hover:bg-[#E8E9FF] hover:text-[#2A2FFF] transition-all"
              >
                Ajouter
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8E9FF]
                               text-[#2A2FFF] text-xs rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
                      }
                      className="hover:text-red-500 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[#0D0F2E]">Tribu publique</p>
              <p className="text-xs text-[#6B7280]">Visible et rejoignable par tous</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative
                ${form.isPublic ? 'bg-[#2A2FFF]' : 'bg-[#D1D5DB]'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                  transition-all duration-200 ${form.isPublic ? 'left-5' : 'left-0.5'}`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[#DC2626] text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-[#374151]
                       font-medium text-sm hover:bg-[#F9FAFB] transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-[#2A2FFF] text-white font-semibold text-sm
                       shadow-[0_4px_16px_rgba(42,47,255,0.35)]
                       hover:bg-[#1A1ECC] disabled:opacity-50 transition-all"
          >
            {loading ? 'Creation...' : 'Creer la tribu'}
          </button>
        </div>
      </div>
    </div>
  );
}
