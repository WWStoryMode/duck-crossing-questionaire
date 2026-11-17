import { evaluate } from '../../shared/evaluate.js';
import { ANSWER_LABELS, type Answer, type AnswerKey } from '../../shared/types.js';
import { EvalBadge } from './EvalBadge';

/** Shown under a card on the student page once the teacher reveals answers. */
export function RevealPanel({ answerKey, cardId, answer }: { answerKey: AnswerKey; cardId: string; answer?: Answer }) {
  const entry = answerKey[cardId];
  if (!entry) return null;
  const ev = evaluate(answerKey, cardId, answer);
  return (
    <div className="mt-4 rounded-xl border border-navy/15 bg-paper p-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-base">
        <dt className="font-semibold">Your answer</dt>
        <dd>{answer ? ANSWER_LABELS[answer] : '—'}</dd>
        <dt className="font-semibold">Suggested</dt>
        <dd className="font-bold">{ANSWER_LABELS[entry.preferred]}</dd>
        {entry.alternatives.length > 0 && (
          <>
            <dt className="font-semibold">Also defensible</dt>
            <dd>{entry.alternatives.map((a) => ANSWER_LABELS[a]).join(', ')}</dd>
          </>
        )}
      </dl>
      {ev && (
        <div className="mt-3">
          <EvalBadge evaluation={ev} />
        </div>
      )}
      <p className="mt-3 leading-relaxed">{entry.explanation}</p>
    </div>
  );
}
