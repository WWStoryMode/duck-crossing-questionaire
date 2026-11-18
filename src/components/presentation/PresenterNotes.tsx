import { formatDuration, type SlideDef } from './slides';

/** Collapsible notes panel. Teacher-facing; hidden by default. */
export function PresenterNotes({ slide, index, onClose }: { slide: SlideDef; index: number; onClose: () => void }) {
  const n = slide.notes;
  return (
    <aside aria-label="Presenter notes" className="flex w-[min(26rem,40vw)] shrink-0 flex-col overflow-y-auto border-l border-navy/15 bg-white p-4 text-navy">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-moss">Presenter notes · slide {index + 1}</p>
          <h2 className="text-lg font-extrabold leading-snug">{slide.title}</h2>
        </div>
        <button type="button" className="ctl-btn" onClick={onClose} aria-keyshortcuts="N">
          Hide
        </button>
      </div>
      <p className="mt-2 inline-block self-start rounded-full bg-sun-light px-3 py-1 text-sm font-bold">
        Suggested time {formatDuration(slide.seconds)}
      </p>
      {!n ? (
        <p className="mt-4 text-navy-light">No notes for this slide.</p>
      ) : (
        <div className="mt-3 space-y-4 text-[0.95rem] leading-relaxed">
          <NoteList title="Key points" items={n.points} />
          {n.questions && <NoteList title="Ask" items={n.questions} />}
          {n.misconceptions && <NoteList title="Likely misconceptions" items={n.misconceptions} />}
          {n.transition && (
            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-wide">Transition</h3>
              <p className="mt-1 italic">{n.transition}</p>
            </section>
          )}
        </div>
      )}
    </aside>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-xs font-extrabold uppercase tracking-wide">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
