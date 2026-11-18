import { evaluate, EVALUATION_LABELS } from '../../shared/evaluate.js';
import { ANSWERS, ANSWER_LABELS, type AnswerCounts, type AnswerKey, type Card, type Evaluation } from '../../shared/types.js';
import { BarChart } from './BarChart';
import { EvalBadge } from './EvalBadge';

type Size = 'page' | 'slide';

const SIZES = {
  page: {
    card: 'rounded-2xl p-4 lg:p-5',
    heading: 'mb-3 text-lg font-semibold leading-snug lg:text-xl',
    chip: 'mr-2 rounded-md px-2 py-0.5 text-base',
    reveal: 'mt-4 pt-3',
    suggested: 'text-base font-bold lg:text-lg',
    explanation: 'mt-2 leading-relaxed lg:text-lg',
    tally: 'mt-2 gap-2',
    tallyItem: 'px-3 py-1 text-sm lg:text-base',
    single: 'text-lg',
  },
  slide: {
    card: 'rounded-[1cqw] p-[1cqw]',
    heading: 's-tiny mb-[0.6cqw] font-semibold leading-snug',
    chip: 'mr-[0.5cqw] rounded-[0.4cqw] px-[0.5cqw] py-[0.1cqw]',
    reveal: 'mt-[0.7cqw] pt-[0.6cqw]',
    suggested: 's-tiny font-bold',
    explanation: 's-tiny mt-[0.4cqw]',
    tally: 'mt-[0.4cqw] gap-[0.4cqw]',
    tallyItem: 'px-[0.7cqw] py-[0.15cqw] text-[1cqw]',
    single: 's-small',
  },
} as const;

const TALLY_STYLE: Record<Evaluation, string> = {
  match: 'bg-moss text-white',
  discussion: 'bg-sun text-navy',
  reconsider: 'border-2 border-dashed border-navy bg-white text-navy',
};

type Props = {
  card: Card;
  counts: AnswerCounts;
  /** Groups that answered this table (bar denominator). */
  respondents: number;
  /** Present only after the teacher reveals (from server state). */
  answerKey: AnswerKey | null;
  size?: Size;
  /** Show a single group's choice as text instead of a one-bar chart. */
  singleGroupMode?: boolean;
  idPrefix?: string;
  headingLevel?: 2 | 3;
};

/** One mechanic card with its answer distribution and, after reveal, the suggested answer and explanation. */
export function ResultsCard({ card, counts, respondents, answerKey, size = 'page', singleGroupMode, idPrefix = 'res', headingLevel = 2 }: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const sz = SIZES[size];
  const entry = answerKey?.[card.id];
  const headingId = `${idPrefix}-${card.id}`;
  const onlyAnswer = singleGroupMode && respondents === 1 ? ANSWERS.find((a) => counts[a].real + counts[a].demo > 0) : undefined;

  return (
    <article className={`border border-navy/10 bg-white shadow-sm ${sz.card}`}>
      <Heading id={headingId} className={sz.heading}>
        <span className={`inline-block bg-navy font-extrabold text-paper ${sz.chip}`}>{card.id}</span>
        {card.text}
      </Heading>
      {singleGroupMode && respondents === 0 ? (
        <p className={`${sz.single} italic text-navy-light`}>No responses yet</p>
      ) : onlyAnswer ? (
        <div className={`flex flex-wrap items-center gap-[0.6em] ${sz.single}`}>
          <span>This group chose</span>
          <strong className="rounded-full bg-navy px-[0.8em] py-[0.15em] text-paper">{ANSWER_LABELS[onlyAnswer]}</strong>
          {counts[onlyAnswer].demo > 0 && <span className="text-[0.75em] font-bold">(demo)</span>}
          {answerKey && <EvalBadge evaluation={evaluate(answerKey, card.id, onlyAnswer)!} compact={size === 'slide'} />}
        </div>
      ) : (
        <BarChart
          counts={counts}
          max={respondents}
          labelledBy={headingId}
          size={size}
          markFor={entry ? (a) => (entry.preferred === a ? 'preferred' : entry.alternatives.includes(a) ? 'alternative' : null) : undefined}
        />
      )}
      {answerKey && entry && (
        <div className={`border-t border-navy/10 ${sz.reveal}`}>
          <p className={sz.suggested}>
            Suggested: {ANSWER_LABELS[entry.preferred]}
            {entry.alternatives.length > 0 && (
              <span className="font-medium"> · Also defensible: {entry.alternatives.map((a) => ANSWER_LABELS[a]).join(', ')}</span>
            )}
          </p>
          {!onlyAnswer && <Tallies answerKey={answerKey} cardId={card.id} counts={counts} size={size} />}
          <p className={sz.explanation}>{entry.explanation}</p>
        </div>
      )}
    </article>
  );
}

/** How many groups matched / gave a defensible alternative / should reconsider. */
export function Tallies({ answerKey, cardId, counts, size = 'page' }: { answerKey: AnswerKey; cardId: string; counts: AnswerCounts; size?: Size }) {
  const sz = SIZES[size];
  const tally: Record<Evaluation, number> = { match: 0, discussion: 0, reconsider: 0 };
  for (const a of ANSWERS) {
    const ev = evaluate(answerKey, cardId, a);
    if (ev) tally[ev] += counts[a].real + counts[a].demo;
  }
  return (
    <ul className={`flex flex-wrap ${sz.tally}`} aria-label="Group results for this card">
      {(Object.keys(tally) as Evaluation[]).map((ev) => (
        <li key={ev} className={`rounded-full font-bold ${sz.tallyItem} ${TALLY_STYLE[ev]}`}>
          <span aria-hidden>{EVALUATION_LABELS[ev].icon} </span>
          {ev === 'match' ? 'Matches' : EVALUATION_LABELS[ev].label}: {tally[ev]}
        </li>
      ))}
    </ul>
  );
}
