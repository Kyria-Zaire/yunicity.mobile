'use client';

import { useEffect, useState } from 'react';

const TARGET = 47;
const START = 44;
const DURATION_MS = 1500;

export function SignupCounter() {
  const [n, setN] = useState(START);

  useEffect(() => {
    let frame: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION_MS);
      const eased = 1 - (1 - t) ** 2;
      setN(Math.round(START + (TARGET - START) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <p className="font-mono text-[13px] text-[#9395FF] mt-6">
      🏙️ <span className="tabular-nums font-semibold text-[#E8E9FF]">{n}</span>{' '}
      Rémois déjà inscrits
    </p>
  );
}
