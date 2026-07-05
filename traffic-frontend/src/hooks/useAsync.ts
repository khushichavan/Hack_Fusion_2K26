import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an async loader on mount (and whenever `deps` change), exposing
 * loading / error / data so pages can render skeletons and error states.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const mounted = useRef(true);

  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => {
        if (mounted.current) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (mounted.current)
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Something went wrong",
          });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    run();
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { ...state, refetch: run };
}
