import { useEffect, useMemo, useState } from 'react';

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableDeps = useMemo(() => deps, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetcher()
      .then((d) => {
        if (cancelled) return;
        setData(d);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Erreur réseau');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, stableDeps);

  return { data, error, loading };
}

