'use client';

import { useState } from 'react';

export function LandingCtaForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label htmlFor="landing-email" className="sr-only">
        Adresse e-mail
      </label>
      <input
        id="landing-email"
        name="email"
        type="email"
        required
        placeholder="ton@email.fr"
        className="flex-1 h-12 px-4 rounded-xl bg-transparent border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#2A2FFF] focus:shadow-[0_0_0_4px_rgba(42,47,255,0.15)] transition-all duration-200 font-body text-sm"
        aria-label="Adresse e-mail pour être informé du lancement"
      />
      <button
        type="submit"
        className="h-12 px-8 rounded-xl bg-[#2A2FFF] text-white font-display font-semibold text-sm tracking-wide shadow-primary hover:bg-[#1A1ECC] hover:shadow-[0_12px_40px_rgba(42,47,255,0.45)] active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F2E]"
      >
        {sent ? 'Merci !' : "M'informer"}
      </button>
    </form>
  );
}
