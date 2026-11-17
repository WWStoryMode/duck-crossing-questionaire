import { ANSWERS, ANSWER_LABELS, type Answer, type AnswerCounts } from '../../shared/types.js';

export type BarMark = 'preferred' | 'alternative' | null;

type Props = {
  counts: AnswerCounts;
  /** Denominator for bar length: groups that answered this table. */
  max: number;
  /** After reveal: which answers to mark. */
  markFor?: (a: Answer) => BarMark;
  labelledBy?: string;
};

const DEMO_TEXTURE =
  'repeating-linear-gradient(135deg, #3A4A63 0 3px, transparent 3px 7px)';

/**
 * Horizontal bars, one per answer. A single series (group counts):
 * real responses = solid ink fill, demo responses = hatched texture of the same ink,
 * separated by a 2px gap. Every bar carries its count and label as text.
 */
export function BarChart({ counts, max, markFor, labelledBy }: Props) {
  const denom = Math.max(max, 1);
  return (
    <ul className="space-y-1.5" aria-labelledby={labelledBy}>
      {ANSWERS.map((a) => {
        const { real, demo } = counts[a];
        const total = real + demo;
        const mark = markFor?.(a) ?? null;
        const tip = `${ANSWER_LABELS[a]}: ${total} group${total === 1 ? '' : 's'}${demo ? ` (${demo} demo)` : ''}`;
        return (
          <li
            key={a}
            title={tip}
            aria-label={tip + (mark === 'preferred' ? ', suggested answer' : mark === 'alternative' ? ', also defensible' : '')}
            className={`grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-2 rounded-lg px-1.5 py-1 lg:grid-cols-[7rem_1fr_3rem] ${
              mark === 'preferred' ? 'bg-moss-light ring-[3px] ring-moss' : mark === 'alternative' ? 'bg-sun-light ring-2 ring-sun' : ''
            }`}
          >
            <span className="text-sm font-bold lg:text-lg">
              {mark === 'preferred' && <span aria-hidden>★ </span>}
              {ANSWER_LABELS[a]}
            </span>
            <span className="flex h-6 items-center gap-[2px] lg:h-8" aria-hidden>
              {real > 0 && (
                <span className="h-full rounded-r-[4px] bg-navy-light" style={{ width: `${(real / denom) * 100}%` }} />
              )}
              {demo > 0 && (
                <span
                  className="h-full rounded-r-[4px] border border-navy-light"
                  style={{ width: `${(demo / denom) * 100}%`, backgroundImage: DEMO_TEXTURE }}
                />
              )}
              {total === 0 && <span className="h-full w-[2px] bg-navy/20" />}
            </span>
            <span className="text-right text-base font-extrabold tabular-nums lg:text-xl">{total}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function BarLegend({ showDemo }: { showDemo: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm lg:text-base">
      <span className="flex items-center gap-2">
        <span aria-hidden className="inline-block h-4 w-6 rounded-sm bg-navy-light" /> Student groups
      </span>
      {showDemo && (
        <span className="flex items-center gap-2">
          <span aria-hidden className="inline-block h-4 w-6 rounded-sm border border-navy-light" style={{ backgroundImage: DEMO_TEXTURE }} />
          Demo responses (simulated)
        </span>
      )}
    </div>
  );
}
