import { useEffect, useRef, useState } from 'react';
import { DISCLAIMER, getTable } from '../../shared/content.js';
import type { Answer, SubmitAck, TableId } from '../../shared/types.js';
import { AnswerPicker } from '../components/AnswerPicker';
import { Outcomes } from '../components/Outcomes';
import { Duck } from '../components/Duck';
import { RevealPanel } from '../components/RevealPanel';
import { emitAck, socket, usePublicState } from '../socket';

type Notice = { tone: 'ok' | 'warn' | 'error'; text: string };

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

  // Server-issued ID, kept only in this page's memory (lost on refresh by design).
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const submittingRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the page heading when the activity opens (screen readers announce the table).
  useEffect(() => {
    headingRef.current?.focus();
    document.title = `Table ${tableId} — Duck Crossing`;
    window.scrollTo(0, 0);
  }, [tableId]);

  const { state, connected } = usePublicState();
  const locked = !!state?.locked;
  const key = state?.revealed ? state.key : null;

  const answered = table.cards.filter((c) => answers[c.id]).length;
  const complete = answered === table.cards.length;
  const snapshot = JSON.stringify({ answers, debatableCardId, justification });
  const submitted = submissionId !== null;
  const unsaved = submitted && snapshot !== savedSnapshot;

  // Teacher reset the session: our ID is gone, the next submit will be a new response.
  useEffect(() => {
    const onReset = () => {
      setSubmissionId(null);
      setSavedSnapshot(null);
      setNotice({
        tone: 'warn',
        text: 'Your teacher reset the activity. Your answers are still here — submit again (this counts as a new response).',
      });
    };
    socket.on('session:reset', onReset);
    return () => {
      socket.off('session:reset', onReset);
    };
  }, []);

  // When submissions lock, show exactly what was submitted (drop unsent edits).
  useEffect(() => {
    if (!locked) return;
    setNotice((n) => (n?.tone === 'ok' ? null : n));
    if (!savedSnapshot) return;
    const saved = JSON.parse(savedSnapshot) as { answers: Record<string, Answer>; debatableCardId: string; justification: string };
    setAnswers(saved.answers);
    setDebatableCardId(saved.debatableCardId);
    setJustification(saved.justification);
  }, [locked, savedSnapshot]);

  async function submit() {
    if (!complete || locked || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setNotice(null);
    const hadId = submissionId !== null;
    try {
      const res = await emitAck<SubmitAck>('student:submit', {
        submissionId: submissionId ?? undefined,
        table: table.id,
        groupName,
        answers,
        debatableCardId,
        justification,
      });
      if (!res.ok) {
        setNotice({ tone: 'error', text: res.error });
        return;
      }
      setSubmissionId(res.submissionId);
      setSavedSnapshot(snapshot);
      if (hadId && res.isNew) {
        setNotice({ tone: 'warn', text: 'Your earlier response was no longer on the server, so this was saved as a new response.' });
      } else {
        setNotice({
          tone: 'ok',
          text: hadId
            ? 'Answers updated ✓ You can keep editing until your teacher locks submissions.'
            : 'Answers submitted ✓ You can still edit and resubmit until your teacher locks submissions.',
        });
      }
    } catch {
      setNotice({ tone: 'error', text: 'Could not reach the server. Check your connection and try again.' });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const disabled = locked;
  const canSubmit = complete && !locked && !submitting && connected && (!submitted || unsaved);
  const buttonLabel = submitting ? 'Submitting…' : submitted ? (unsaved ? 'Update answers' : 'Submitted ✓') : 'Submit answers';

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-10 border-b border-navy/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Duck className="h-8 w-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 ref={headingRef} tabIndex={-1} className="truncate font-extrabold focus:outline-none">
              Table {table.id}: {table.title}
            </h1>
            {groupName && <p className="truncate text-sm text-navy-light">Group: {groupName}</p>}
          </div>
          <p
            aria-live="polite"
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${complete ? 'bg-moss text-white' : 'bg-sun-light'}`}
          >
            {answered}/{table.cards.length} answered
          </p>
        </div>
        {!connected && (
          <p role="status" className="bg-sun px-4 py-1 text-center text-sm font-bold">Reconnecting to the classroom…</p>
        )}
        <div className="h-1.5 bg-navy/10" aria-hidden>
          <div className="h-full bg-moss transition-all" style={{ width: `${(answered / table.cards.length) * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        {!submitted && (
          <button type="button" onClick={onBack} className="text-sm font-semibold underline underline-offset-4">
            ← Change table
          </button>
        )}

        {locked && (
          <p role="status" className="rounded-xl border-2 border-navy bg-white px-4 py-3 font-bold">
            🔒 Submissions are locked. {submitted ? 'Your last submitted answers are shown below.' : 'Your teacher is no longer accepting answers.'}
          </p>
        )}
        {key && (
          <p className="rounded-xl bg-moss-light px-4 py-3">
            <strong>Suggested answers revealed.</strong> {DISCLAIMER}
          </p>
        )}

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
                disabled={disabled}
              />
              {key && <RevealPanel answerKey={key} cardId={card.id} answer={answers[card.id]} />}
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
            disabled={disabled}
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
            disabled={disabled}
            className="mt-1 block w-full rounded-xl border-2 border-navy/20 bg-white px-3 py-3 text-base"
            placeholder="We weren't sure because…"
          />
        </section>

        <div className="space-y-3">
          <div aria-live="polite">
            {notice && (
              <p
                className={`rounded-xl px-4 py-3 font-semibold ${
                  notice.tone === 'ok' ? 'bg-moss text-white' : notice.tone === 'warn' ? 'bg-sun-light' : 'border-2 border-navy bg-white'
                }`}
              >
                {notice.tone === 'error' && '⚠ '}
                {notice.text}
              </p>
            )}
            {unsaved && !locked && (
              <p className="mt-2 rounded-xl bg-sun-light px-4 py-2 text-sm font-semibold">
                You have changes that haven't been submitted yet.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className="w-full rounded-xl bg-navy px-6 py-4 text-xl font-bold text-paper shadow enabled:hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonLabel}
          </button>
          {!complete && !locked && (
            <p className="text-center text-sm">Classify all six mechanics to submit ({table.cards.length - answered} left).</p>
          )}
          {!submitted && !locked && (
            <p className="text-center text-sm text-navy-light">
              If your group already submitted and then refreshed this page, submitting again will count as a new response.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
