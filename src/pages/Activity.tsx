import { useState } from 'react';
import { getTable } from '../../shared/content.js';
import type { Answer, TableId } from '../../shared/types.js';
import { AnswerPicker } from '../components/AnswerPicker';
import { Outcomes } from '../components/Outcomes';
import { Duck } from '../components/Duck';

type Props = {
  table: TableId;
  groupName: string;
  onBack: () => void;
};

export function Activity({ table: tableId, groupName, onBack }: Props) {
  const table = getTable(tableId);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [debatableCardId, setDebatableCardId] = useState('');
  const [justification, setJustification] = useState('');

  const answered = table.cards.filter((c) => answers[c.id]).length;
  const complete = answered === table.cards.length;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-navy/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Duck className="h-8 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold">
              Table {table.id}: {table.title}
            </p>
            {groupName && <p className="truncate text-sm text-navy-light">Group: {groupName}</p>}
          </div>
          <p
            aria-live="polite"
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${complete ? 'bg-moss text-white' : 'bg-sun-light'}`}
          >
            {answered}/{table.cards.length} answered
          </p>
        </div>
        <div className="h-1.5 bg-navy/10" aria-hidden>
          <div className="h-full bg-moss transition-all" style={{ width: `${(answered / table.cards.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <button type="button" onClick={onBack} className="text-sm font-semibold underline underline-offset-4">
          ← Change table
        </button>

        <section aria-label="Learning outcomes">
          <Outcomes table={table} />
        </section>

        <section aria-label="Mechanic cards" className="space-y-4">
          {table.cards.map((card) => (
            <article key={card.id} className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-5">
              <p id={`card-${card.id}`} className="mb-3 text-lg font-semibold leading-snug">
                <span className="mr-2 inline-block rounded-md bg-navy px-2 py-0.5 text-sm font-extrabold text-paper">
                  {card.id}
                </span>
                {card.text}
              </p>
              <AnswerPicker
                name={`card-${card.id}`}
                labelledBy={`card-${card.id}`}
                value={answers[card.id]}
                onChange={(a) => setAnswers((prev) => ({ ...prev, [card.id]: a }))}
              />
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-sun-light p-4 sm:p-5" aria-labelledby="debate">
          <h2 id="debate" className="text-lg font-bold">
            One debatable card <span className="font-normal text-navy-light">(optional)</span>
          </h2>
          <p className="mt-1 text-sm">Which card did your group find hardest to decide? Explain your reasoning.</p>
          <label htmlFor="debatable" className="mt-3 block font-semibold">Card</label>
          <select
            id="debatable"
            value={debatableCardId}
            onChange={(e) => setDebatableCardId(e.target.value)}
            className="mt-1 block w-full rounded-xl border-2 border-navy/20 bg-white px-3 py-3 text-base"
          >
            <option value="">— Choose a card —</option>
            {table.cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.text.length > 60 ? c.text.slice(0, 57) + '…' : c.text}
              </option>
            ))}
          </select>
          <label htmlFor="why" className="mt-3 block font-semibold">Our reasoning</label>
          <textarea
            id="why"
            rows={4}
            maxLength={1000}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="mt-1 block w-full rounded-xl border-2 border-navy/20 bg-white px-3 py-3 text-base"
            placeholder="We weren't sure because…"
          />
        </section>

        <div>
          <button
            type="button"
            disabled={!complete}
            className="w-full rounded-xl bg-navy px-6 py-4 text-xl font-bold text-paper shadow enabled:hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit answers
          </button>
          {!complete && (
            <p className="mt-2 text-center text-sm">Classify all six mechanics to submit ({6 - answered} left).</p>
          )}
        </div>
      </main>
    </div>
  );
}
