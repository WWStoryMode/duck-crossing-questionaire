import { ANSWERS, ANSWER_LABELS, type Answer, type AnswerCounts } from '../../shared/types.js';

export type BarMark = 'preferred' | 'alternative' | null;

type Props = {
  counts: AnswerCounts;
  /** Denominator for bar length: groups that answered this table. */
  max: number;
  /** After reveal: which answers to mark. */
  markFor?: (a: Answer) => BarMark;
  labelledBy?: string;
  /** 'slide' sizes everything relative to the presentation stage. */
  size?: 'page' | 'slide';
};

const SIZES = {
  page: {
    list: 'space-y-1.5',
    row: 'grid-cols-[5.5rem_1fr_2.5rem] gap-2 rounded-lg px-1.5 py-1 lg:grid-cols-[7rem_1fr_3rem]',
    label: 'text-sm font-bold lg:text-lg',
    bar: 'h-6 lg:h-8',
    count: 'text-base font-extrabold lg:text-xl',
  },
  slide: {
    list: 'space-y-[0.35cqw]',
    row: 'grid-cols-[6.5cqw_1fr_2.4cqw] gap-[0.6cqw] rounded-[0.5cqw] px-[0.4cqw] py-[0.2cqw]',
    label: 's-tiny font-bold',
    bar: 'h-[1.4cqw]',
    count: 's-small font-extrabold',
  },
};

const DEMO_TEXTURE =
  'repeating-linear-gradient(135deg, #3A4A63 0 3px, transparent 3px 7px)';

/**
 * Horizontal bars, one per answer. A single series (group counts):
 * real responses = solid ink fill, demo responses = hatched texture of the same ink,
 * separated by a 2px gap. Every bar carries its count and label as text.
 */
export function BarChart({ counts, max, markFor, labelledBy, size = 'page' }: Props) {
  const denom = Math.max(max, 1);
  const sz = SIZES[size];
  return (
    <ul className={sz.list} aria-labelledby={labelledBy}>
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
            className={`grid items-center ${sz.row} ${
              mark === 'preferred' ? 'bg-moss-light ring-[3px] ring-moss' : mark === 'alternative' ? 'bg-sun-light ring-2 ring-sun' : ''
            }`}
          >
            <span className={sz.label}>
              {mark === 'preferred' && <span aria-hidden>★ </span>}
              {ANSWER_LABELS[a]}
            </span>
            <span className={`flex items-center gap-[2px] ${sz.bar}`} aria-hidden>
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
            <span className={`text-right tabular-nums ${sz.count}`}>{total}</span>
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
