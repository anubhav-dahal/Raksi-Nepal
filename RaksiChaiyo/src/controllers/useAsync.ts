import { useCallback, useEffect, useRef, useState } from 'react';

export type AsyncState<T> = {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  /** Re-runs the request (keeps showing old data while loading). */
  reload: () => Promise<void>;
};

/** Runs an async loader when deps change and tracks loading / error / data. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === latest.current) setData(result);
    } catch (e) {
      if (id === latest.current) setError(e);
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}
