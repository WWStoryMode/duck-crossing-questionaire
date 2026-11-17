import { EVALUATION_LABELS } from '../../shared/evaluate.js';
import type { Evaluation } from '../../shared/types.js';

const STYLES: Record<Evaluation, string> = {
  match: 'bg-moss text-white border-moss',
  discussion: 'bg-sun text-navy border-sun',
  reconsider: 'bg-white text-navy border-navy border-dashed',
};

/** Colour + icon + text, so meaning never depends on colour alone. */
export function EvalBadge({ evaluation, compact }: { evaluation: Evaluation; compact?: boolean }) {
  const { label, icon } = EVALUATION_LABELS[evaluation];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 font-bold ${STYLES[evaluation]} ${
        compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
