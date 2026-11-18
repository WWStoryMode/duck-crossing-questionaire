import { formatMs, type Timer } from './useTimer';

export const SESSION_MS = 15 * 60 * 1000;
export const ACTIVITY_MS = 4 * 60 * 1000;

function StartPause({ timer, label }: { timer: Timer; label: string }) {
  return (
    <button type="button" className="ctl-btn" onClick={timer.running ? timer.pause : timer.start} aria-label={`${timer.running ? 'Pause' : 'Start'} ${label}`}>
      {timer.running ? '❚❚' : '▶'}
    </button>
  );
}

/** Session timer for the control bar: elapsed · remaining of 15:00, with start/pause/reset. */
export function SessionTimer({ timer }: { timer: Timer }) {
  const over = timer.elapsed > SESSION_MS;
  return (
    <div role="group" aria-label="Session timer" className={`flex items-center gap-1 rounded-xl px-2 py-1 ${over ? 'bg-sun' : 'bg-white'}`}>
      <span className="text-sm font-bold tabular-nums" aria-live="off">
        ⏱ {formatMs(timer.elapsed, 'down')}
        <span className="font-medium"> · {over ? `over by ${formatMs(timer.elapsed - SESSION_MS, 'down')}` : `${formatMs(SESSION_MS - timer.elapsed)} left`}</span>
      </span>
      <StartPause timer={timer} label="session timer" />
      <button type="button" className="ctl-btn" onClick={timer.reset} aria-label="Reset session timer" disabled={timer.elapsed === 0}>
        ↺
      </button>
    </div>
  );
}

/** Large activity countdown for slide 5. Reaching zero does NOT lock submissions. */
export function ActivityCountdown({ timer }: { timer: Timer }) {
  const remaining = ACTIVITY_MS - timer.elapsed;
  const done = remaining <= 0;
  const started = timer.elapsed > 0;
  return (
    <div
      role="group"
      aria-label="Activity countdown"
      className={`flex items-center gap-[1.4cqw] rounded-[1.2cqw] px-[1.6cqw] py-[1cqw] ${done ? 'bg-sun' : started ? 'bg-moss-light' : 'bg-white ring-1 ring-navy/15'}`}
    >
      <span className="s-h2 tabular-nums">{done ? "Time's up" : formatMs(remaining)}</span>
      <span className="s-tiny flex-1">{done ? 'Finish your discussion and submit.' : started ? (timer.running ? 'Activity running' : 'Paused') : '4-minute activity'}</span>
      <span className="flex gap-1 text-sm">
        {!done && (
          <button type="button" className="ctl-btn" onClick={timer.running ? timer.pause : timer.start}>
            {timer.running ? '❚❚ Pause' : started ? '▶ Resume' : '▶ Start 4:00'}
          </button>
        )}
        {started && (
          <button type="button" className="ctl-btn" onClick={timer.reset}>
            ↺ Reset
          </button>
        )}
      </span>
    </div>
  );
}

/** Compact pill so the activity countdown stays visible on every slide once started. */
export function ActivityPill({ timer }: { timer: Timer }) {
  if (timer.elapsed === 0) return null;
  const remaining = ACTIVITY_MS - timer.elapsed;
  const done = remaining <= 0;
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${done ? 'bg-sun' : 'bg-moss-light'}`}>
      Activity {done ? "time's up" : `${formatMs(remaining)}${timer.running ? '' : ' (paused)'}`}
    </span>
  );
}
