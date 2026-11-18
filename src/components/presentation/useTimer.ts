import { useCallback, useEffect, useState } from 'react';

/**
 * Pause-safe stopwatch based on Date.now() (no drift from interval timing).
 * Local to this browser tab only — nothing is sent to the server.
 */
export function useTimer(limitMs?: number) {
  const [state, setState] = useState({ running: false, startedAt: 0, banked: 0 });
  const [, tick] = useState(0);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => tick((n) => n + 1), 250);
    return () => window.clearInterval(id);
  }, [state.running]);

  const elapsed = state.banked + (state.running ? Date.now() - state.startedAt : 0);

  // A countdown stops itself at zero (but never triggers anything else).
  useEffect(() => {
    if (limitMs !== undefined && state.running && elapsed >= limitMs) {
      setState({ running: false, startedAt: 0, banked: limitMs });
    }
  }, [elapsed, limitMs, state.running]);

  const start = useCallback(() => setState((s) => (s.running ? s : { ...s, running: true, startedAt: Date.now() })), []);
  const pause = useCallback(
    () => setState((s) => (s.running ? { running: false, startedAt: 0, banked: s.banked + Date.now() - s.startedAt } : s)),
    [],
  );
  const reset = useCallback(() => setState({ running: false, startedAt: 0, banked: 0 }), []);

  return { elapsed, running: state.running, start, pause, reset };
}

export type Timer = ReturnType<typeof useTimer>;

/** Remaining times round up (a countdown never shows 0:00 early); elapsed times round down. */
export function formatMs(ms: number, round: 'up' | 'down' = 'up') {
  const s = Math.max(0, (round === 'up' ? Math.ceil : Math.floor)(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
