import { useEffect, useRef } from 'react';
import { formatDuration, SLIDES } from './slides';

/** Grid of all slides; pick one to jump to it. */
export function Overview({ current, onPick, onClose }: { current: number; onPick: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Slide overview"
      className="fixed inset-0 z-40 overflow-auto bg-navy/80 p-6"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto max-w-5xl rounded-2xl bg-paper p-6 text-navy">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">All slides</h2>
          <button type="button" className="ctl-btn" onClick={onClose}>Close (Esc)</button>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SLIDES.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                ref={i === current ? ref : undefined}
                aria-current={i === current ? 'step' : undefined}
                onClick={() => onPick(i)}
                className={`flex aspect-video w-full flex-col justify-between rounded-xl border-2 p-3 text-left ${
                  i === current ? 'border-navy bg-sun-light' : 'border-navy/20 bg-white hover:border-navy'
                }`}
              >
                <span className="text-sm font-extrabold">{i + 1}</span>
                <span className="font-bold leading-snug">{s.title}</span>
                <span className="text-xs">{formatDuration(s.seconds)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
