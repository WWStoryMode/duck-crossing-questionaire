import { useEffect } from 'react';
import { DISCLAIMER, getTable } from '../../../shared/content.js';
import { TABLE_IDS, type TableId } from '../../../shared/types.js';
import { BarLegend } from '../BarChart';
import { ResultsCard } from '../ResultsCard';
import { TableTabs } from '../TableTabs';
import { usePublicState } from '../../socket';
import { usePresentation } from './context';
import { isInteractiveTarget } from './keys';
import { TeacherControls } from './TeacherControls';

/**
 * Slide 6: live answers from the existing Socket.IO public state (same data as /results).
 * The answer key only exists in that state after the teacher reveals, so nothing leaks early.
 */
export function LiveResultsSlide() {
  const { state, connected } = usePublicState();
  const { liveTable, setLiveTable } = usePresentation();
  const table = getTable(liveTable);
  const groups = state?.groups[liveTable] ?? { real: 0, demo: 0 };
  const respondents = groups.real + groups.demo;
  const key = state?.revealed ? state.key : null;

  // Keys 1–4 switch tables without leaving the slide.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isInteractiveTarget(e)) return;
      const n = Number(e.key);
      if ((TABLE_IDS as number[]).includes(n)) setLiveTable(n as TableId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setLiveTable]);

  return (
    <div className="flex h-full flex-col px-[3cqw] pb-[5.5cqw] pt-[2.4cqw]">
      <div className="flex items-end justify-between gap-[2cqw]">
        <h2 className="s-h2">What Did We Choose, and Why?</h2>
        <p className="s-small shrink-0 rounded-full bg-white px-[1.2cqw] py-[0.4cqw] font-bold shadow-sm" aria-live="polite">
          Table {liveTable}: {groups.real} group{groups.real === 1 ? '' : 's'}
          {groups.demo > 0 && <span className="font-medium"> + {groups.demo} demo</span>}
        </p>
      </div>

      <div className="mt-[1cqw] flex flex-wrap items-center gap-[1cqw]">
        <TableTabs value={liveTable} onChange={setLiveTable} idPrefix="live-tab" />
        <span className="s-tiny text-navy-light">Keys 1–4</span>
        <div className="ml-auto text-sm">
          <TeacherControls />
        </div>
      </div>
      {state?.locked && <p className="s-tiny mt-[0.5cqw] font-bold">🔒 Submissions are locked.</p>}

      {!connected && (
        <p role="status" className="s-small mt-[0.8cqw] rounded-[0.8cqw] bg-sun px-[1.2cqw] py-[0.5cqw] font-bold">
          ○ Disconnected — showing the last results received. Reconnecting…
        </p>
      )}
      {key && (
        <p className="s-tiny mt-[0.8cqw] rounded-[0.8cqw] bg-moss-light px-[1.2cqw] py-[0.4cqw]">
          <strong>Suggested answers revealed.</strong> ★ suggested · yellow = also defensible. <span className="italic">{DISCLAIMER}</span>
        </p>
      )}

      <div
        role="tabpanel"
        id="live-tab-panel"
        aria-labelledby={`live-tab-${liveTable}`}
        className="mt-[1cqw] min-h-0 flex-1 overflow-y-auto pr-[0.5cqw]"
        tabIndex={0}
      >
        {!state ? (
          <p className="s-body">Connecting to the classroom…</p>
        ) : (
          <>
            {groups.demo > 0 && (
              <div className="s-tiny mb-[0.6cqw]">
                <BarLegend showDemo />
              </div>
            )}
            <div className="grid grid-cols-3 gap-[1cqw]">
              {table.cards.map((card) => (
                <ResultsCard
                  key={card.id}
                  card={card}
                  counts={state.counts[card.id]}
                  respondents={respondents}
                  answerKey={key}
                  size="slide"
                  singleGroupMode
                  idPrefix="live"
                  headingLevel={3}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
