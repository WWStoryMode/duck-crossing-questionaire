import { useRef, type KeyboardEvent } from 'react';
import { TABLE_IDS, type TableId } from '../../shared/types.js';
import { getTable } from '../../shared/content.js';

/** Accessible tablist (arrow keys / Home / End). */
export function TableTabs({ value, onChange, idPrefix = 'tab' }: { value: TableId; onChange: (t: TableId) => void; idPrefix?: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % TABLE_IDS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABLE_IDS.length) % TABLE_IDS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABLE_IDS.length - 1;
    else return;
    e.preventDefault();
    onChange(TABLE_IDS[next]);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label="Tables" className="flex flex-wrap gap-2">
      {TABLE_IDS.map((t, i) => {
        const selected = t === value;
        return (
          <button
            key={t}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`${idPrefix}-${t}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded-xl px-4 py-2 text-left font-bold ${selected ? 'bg-navy text-paper' : 'border-2 border-navy/20 bg-white'}`}
          >
            Table {t}
            <span className="block text-xs font-medium opacity-80">{getTable(t).title}</span>
          </button>
        );
      })}
    </div>
  );
}
