import { ANSWER_KEY, getTable } from '../../shared/content.js';
import { evaluate, EVALUATION_LABELS } from '../../shared/evaluate.js';
import { ANSWER_LABELS, type Submission, type TableId } from '../../shared/types.js';
import { Outcomes } from './Outcomes';

const EVAL_CELL = {
  match: 'bg-moss-light',
  discussion: 'bg-sun-light',
  reconsider: 'bg-white',
} as const;

function time(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Teacher-only view of one table: every group's answers with evaluation markers
 * (the teacher can always see the key) and their written justifications.
 */
export function TeacherTable({ tableId, submissions }: { tableId: TableId; submissions: Submission[] }) {
  const table = getTable(tableId);
  const rows = submissions.filter((s) => s.table === tableId);
  const withReasons = rows.filter((s) => s.justification || s.debatableCardId);

  return (
    <div className="space-y-6">
      <Outcomes table={table} />

      <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Answers from Table {tableId} groups</caption>
          <thead>
            <tr className="border-b-2 border-navy/20">
              <th scope="col" className="p-3">Group</th>
              {table.cards.map((c) => (
                <th key={c.id} scope="col" className="p-3 align-bottom" title={c.text}>
                  <span className="block">{c.id}</span>
                  <span className="block text-xs font-normal">Key: {ANSWER_LABELS[ANSWER_KEY[c.id].preferred]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-navy-light">No responses from this table yet.</td>
              </tr>
            )}
            {rows.map((s, i) => (
              <tr key={s.id} className={`border-b border-navy/10 ${s.isDemo ? 'bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgba(27,42,65,0.04)_8px_16px)]' : ''}`}>
                <th scope="row" className="p-3 font-semibold">
                  {s.isDemo && <span className="mr-2 rounded bg-navy px-1.5 py-0.5 text-xs font-extrabold text-paper">DEMO</span>}
                  {s.groupName || `Group ${i + 1}`}
                  <span className="block text-xs font-normal text-navy-light">updated {time(s.updatedAt)}</span>
                </th>
                {table.cards.map((c) => {
                  const a = s.answers[c.id];
                  const ev = evaluate(ANSWER_KEY, c.id, a)!;
                  const { icon, label } = EVALUATION_LABELS[ev];
                  return (
                    <td key={c.id} className={`p-3 ${EVAL_CELL[ev]}`}>
                      <span className="font-bold">{ANSWER_LABELS[a]}</span>{' '}
                      <span title={label} aria-label={label}>{icon}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-navy-light">
        ✓ Matches suggested answer · ◐ Open for discussion · ↺ Reconsider. Hover a card number to see its text.
      </p>

      <section aria-labelledby="reasons">
        <h3 id="reasons" className="text-lg font-extrabold">Debatable cards & reasoning</h3>
        {withReasons.length === 0 ? (
          <p className="mt-2 text-navy-light">No written justifications yet.</p>
        ) : (
          <ul className="mt-2 grid gap-3 md:grid-cols-2">
            {withReasons.map((s) => {
              const card = table.cards.find((c) => c.id === s.debatableCardId);
              return (
                <li key={s.id} className="rounded-xl border border-navy/10 bg-white p-4">
                  <p className="font-bold">
                    {s.isDemo && <span className="mr-2 rounded bg-navy px-1.5 py-0.5 text-xs font-extrabold text-paper">DEMO</span>}
                    {s.groupName || 'Unnamed group'}
                    {card && <span className="ml-2 rounded-md bg-sun-light px-2 py-0.5 text-sm">Card {card.id}</span>}
                  </p>
                  {card && <p className="mt-1 text-sm italic text-navy-light">“{card.text}”</p>}
                  {card && <p className="mt-1 text-sm">Their answer: <strong>{ANSWER_LABELS[s.answers[card.id]]}</strong></p>}
                  <p className="mt-2 whitespace-pre-wrap">{s.justification || <em className="text-navy-light">No reasoning written.</em>}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
