import { useState, type FormEvent } from 'react';
import { GAME, INSTRUCTIONS, TABLES } from '../../shared/content.js';
import type { TableId } from '../../shared/types.js';
import { DuckFamily } from '../components/Duck';

export function Landing({ onStart }: { onStart: (table: TableId, groupName: string) => void }) {
  document.title = 'Duck Crossing';
  const [table, setTable] = useState<TableId | null>(null);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!table) return setError('Please select your table first.');
    onStart(table, groupName.trim());
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="text-center">
        <DuckFamily className="mx-auto mb-6 h-14 w-full max-w-sm" />
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{GAME.title}</h1>
        <p className="mt-2 text-lg font-medium text-navy-light">{GAME.subtitle}</p>
      </header>

      <section className="mt-8 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="about">
        <h2 id="about" className="text-lg font-bold">About the game</h2>
        <div className="mt-2 space-y-2 leading-relaxed">
          {GAME.description.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-moss-light p-5 sm:p-6" aria-labelledby="howto">
        <h2 id="howto" className="text-lg font-bold">What your group will do</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 leading-relaxed">
          {INSTRUCTIONS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-2 text-sm">There is no fixed number of mechanics per outcome.</p>
      </section>

      <form onSubmit={submit} className="mt-8 space-y-6" noValidate>
        <fieldset>
          <legend className="text-lg font-bold">1. Select your table</legend>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TABLES.map((t) => {
              const selected = table === t.id;
              return (
                <label
                  key={t.id}
                  className={`flex min-h-[64px] cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-navy ${
                    selected ? 'border-navy bg-sun-light' : 'border-navy/20 bg-white hover:border-navy/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="table"
                    value={t.id}
                    checked={selected}
                    onChange={() => { setTable(t.id); setError(''); }}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
                      selected ? 'bg-navy text-paper' : 'bg-paper text-navy'
                    }`}
                  >
                    {t.id}
                  </span>
                  <span>
                    <span className="block font-bold">Table {t.id}</span>
                    <span className="block text-sm text-navy-light">{t.title}</span>
                  </span>
                  {selected && <span className="ml-auto font-bold" aria-hidden>✓</span>}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="group" className="text-lg font-bold">
            2. Group name <span className="font-normal text-navy-light">(optional)</span>
          </label>
          <input
            id="group"
            type="text"
            maxLength={60}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. The Mallards"
            className="mt-2 block w-full rounded-xl border-2 border-navy/20 bg-white px-4 py-3 text-lg focus:border-navy"
            autoComplete="off"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-sun-light px-4 py-2 font-semibold">
            ⚠ {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-navy px-6 py-4 text-xl font-bold text-paper shadow hover:bg-navy-light"
        >
          Start
        </button>
      </form>
    </main>
  );
}
