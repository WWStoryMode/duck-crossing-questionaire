import { useEffect, useState } from 'react';
import { DISCLAIMER, getTable } from '../../shared/content.js';
import { TABLE_IDS, type TableId } from '../../shared/types.js';
import { BarLegend } from '../components/BarChart';
import { ResultsCard } from '../components/ResultsCard';
import { Duck } from '../components/Duck';
import { Outcomes } from '../components/Outcomes';
import { TableTabs } from '../components/TableTabs';
import { usePublicState } from '../socket';

function initialTable(): TableId {
  const t = Number(new URLSearchParams(window.location.search).get('table'));
  return (TABLE_IDS as number[]).includes(t) ? (t as TableId) : 1;
}

export function Results() {
  const { state, connected } = usePublicState();
  const [tableId, setTableId] = useState<TableId>(initialTable);
  const table = getTable(tableId);
  const idx = TABLE_IDS.indexOf(tableId);

  const go = (t: TableId) => {
    setTableId(t);
    const url = new URL(window.location.href);
    url.searchParams.set('table', String(t));
    window.history.replaceState(null, '', url);
  };
  const prev = () => go(TABLE_IDS[(idx - 1 + TABLE_IDS.length) % TABLE_IDS.length]);
  const next = () => go(TABLE_IDS[(idx + 1) % TABLE_IDS.length]);

  // ←/→ switch tables (unless focus is inside the tablist, which handles its own arrows).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('[role=tablist]')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const groups = state?.groups[tableId] ?? { real: 0, demo: 0 };
  const respondents = groups.real + groups.demo;
  const key = state?.revealed ? state.key : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
          <Duck className="h-10 w-12" />
          <div className="mr-auto">
            <p className="text-sm font-bold uppercase tracking-wide text-navy-light">Duck Crossing — live results</p>
            <h1 className="text-2xl font-extrabold lg:text-4xl">
              Table {tableId}: {table.title}
            </h1>
          </div>
          <p className="rounded-full bg-paper px-4 py-2 text-lg font-bold lg:text-xl" aria-live="polite">
            {groups.real} group{groups.real === 1 ? '' : 's'} submitted
            {groups.demo > 0 && <span className="font-medium"> + {groups.demo} demo</span>}
          </p>
          {!connected && (
            <p role="status" className="rounded-full bg-sun px-4 py-2 font-bold">
              Reconnecting…
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 lg:px-8">
        <nav aria-label="Switch table" className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={prev} className="rounded-xl border-2 border-navy bg-white px-4 py-2 text-lg font-bold">
            ← Previous table
          </button>
          <TableTabs value={tableId} onChange={go} idPrefix="results-tab" />
          <button type="button" onClick={next} className="rounded-xl bg-navy px-4 py-2 text-lg font-bold text-paper">
            Next table →
          </button>
        </nav>

        <div role="tabpanel" id="results-tab-panel" aria-labelledby={`results-tab-${tableId}`} className="space-y-5">
          <Outcomes table={table} large />
          {key && (
            <p className="rounded-xl bg-moss-light px-4 py-3 text-base lg:text-lg">
              <strong>Suggested answers revealed.</strong> ★ = suggested answer, highlighted green · yellow = also defensible.{' '}
              <span className="italic">{DISCLAIMER}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BarLegend showDemo={groups.demo > 0} />
            {groups.demo > 0 && (
              <p className="rounded-lg bg-white px-3 py-1 text-sm font-bold">
                Includes {groups.demo} simulated demo response{groups.demo === 1 ? '' : 's'}
              </p>
            )}
          </div>

          {!state ? (
            <p className="text-xl">Connecting…</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {table.cards.map((card) => (
                <ResultsCard key={card.id} card={card} counts={state.counts[card.id]} respondents={respondents} answerKey={key} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

