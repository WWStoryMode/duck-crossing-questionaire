import { useState, type FormEvent } from 'react';
import { TABLE_IDS, type TableId } from '../../shared/types.js';
import { JoinQR } from '../components/JoinQR';
import { TableTabs } from '../components/TableTabs';
import { TeacherTable } from '../components/TeacherTable';
import { Duck } from '../components/Duck';
import { usePublicState } from '../socket';
import { login, teacherAction, useTeacherState } from '../teacher';

export function Teacher() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;
  return <Dashboard onExpired={() => setAuthed(false)} />;
}

function Login({ onSuccess, message }: { onSuccess: () => void; message?: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(message ?? '');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await login(code);
    setBusy(false);
    if (r.ok) onSuccess();
    else setError(r.error);
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Duck className="mx-auto h-16 w-20" />
      <h1 className="mt-4 text-center text-3xl font-extrabold">Teacher dashboard</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="code" className="block font-bold">Access code</label>
        <input
          id="code"
          type="password"
          autoFocus
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="block w-full rounded-xl border-2 border-navy/20 bg-white px-4 py-3 text-lg focus:border-navy"
        />
        {error && <p role="alert" className="rounded-lg bg-sun-light px-3 py-2 font-semibold">⚠ {error}</p>}
        <button disabled={busy || !code} className="w-full rounded-xl bg-navy px-4 py-3 text-lg font-bold text-paper disabled:opacity-50">
          {busy ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </main>
  );
}

function Dashboard({ onExpired }: { onExpired: () => void }) {
  const { state: pub, connected } = usePublicState();
  const { state: teacher, expired } = useTeacherState();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TableId>(1);

  if (expired) {
    return <Login onSuccess={() => window.location.reload()} message="Your teacher session expired (the server may have restarted). Please enter the code again." />;
  }

  const run = async (name: string, event: string, arg?: unknown) => {
    setBusy(name);
    setError('');
    try {
      await teacherAction(event, arg);
    } catch (e) {
      setError((e as Error).message);
      if ((e as Error).message === 'Not authorised.') onExpired();
    } finally {
      setBusy(null);
    }
  };

  const groups = pub?.groups;
  const totalReal = groups ? TABLE_IDS.reduce((n, t) => n + groups[t].real, 0) : 0;
  const totalDemo = groups ? TABLE_IDS.reduce((n, t) => n + groups[t].demo, 0) : 0;
  const locked = !!pub?.locked;
  const revealed = !!pub?.revealed;

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Duck className="h-8 w-9" />
          <h1 className="text-xl font-extrabold">Duck Crossing — Teacher</h1>
          <span
            role="status"
            className={`ml-auto rounded-full px-3 py-1 text-sm font-bold ${connected ? 'bg-moss-light' : 'bg-sun'}`}
          >
            {connected ? '● Live' : 'Reconnecting…'}
          </span>
          <a href="/results" target="_blank" rel="noreferrer" className="rounded-lg border-2 border-navy px-3 py-1 font-bold">
            Open projector view ↗
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <section aria-label="Submission summary" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-2xl bg-navy p-4 text-paper">
                <p className="text-sm font-bold uppercase tracking-wide opacity-80">Groups submitted</p>
                <p className="text-4xl font-extrabold">{totalReal}</p>
                {totalDemo > 0 && <p className="text-sm">+ {totalDemo} demo</p>}
              </div>
              {TABLE_IDS.map((t) => (
                <div key={t} className="rounded-2xl border border-navy/10 bg-white p-4">
                  <p className="text-sm font-bold uppercase tracking-wide text-navy-light">Table {t}</p>
                  <p className="text-3xl font-extrabold">{groups?.[t].real ?? 0}</p>
                  {(groups?.[t].demo ?? 0) > 0 && <p className="text-sm">+ {groups![t].demo} demo</p>}
                </div>
              ))}
            </section>

            <section aria-label="Session controls" className="rounded-2xl border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap gap-3">
                <ToggleButton
                  on={locked}
                  busy={busy === 'lock'}
                  onLabel="🔒 Submissions locked — Unlock"
                  offLabel="🔓 Submissions open — Lock"
                  onClick={() => run('lock', 'teacher:lock', !locked)}
                />
                <ToggleButton
                  on={revealed}
                  busy={busy === 'reveal'}
                  onLabel="👁 Answers revealed — Hide"
                  offLabel="🙈 Answers hidden — Reveal"
                  onClick={() => run('reveal', 'teacher:reveal', !revealed)}
                />
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => {
                    if (window.confirm('Reset ALL submissions (real and demo), unlock and hide answers? This cannot be undone.')) {
                      run('reset', 'teacher:reset');
                    }
                  }}
                  className="rounded-xl border-2 border-dashed border-navy px-4 py-3 font-bold disabled:opacity-50"
                >
                  ↺ Reset all
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-navy/10 pt-4">
                <span className="text-sm font-bold uppercase tracking-wide text-navy-light">Demo mode</span>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => run('demo', 'teacher:addDemo')}
                  className="rounded-xl bg-sun px-4 py-2 font-bold disabled:opacity-50"
                >
                  + Add 4 demo responses
                </button>
                <button
                  type="button"
                  disabled={!!busy || totalDemo === 0}
                  onClick={() => run('cleardemo', 'teacher:clearDemo')}
                  className="rounded-xl border-2 border-navy/30 px-4 py-2 font-bold disabled:opacity-50"
                >
                  Clear demo responses
                </button>
                <span className="text-sm text-navy-light">Demo responses are labelled “DEMO” everywhere and counted separately.</span>
              </div>
              {error && <p role="alert" className="mt-3 rounded-lg bg-sun-light px-3 py-2 font-semibold">⚠ {error}</p>}
            </section>
          </div>
          <JoinQR />
        </div>

        <section aria-label="Responses by table" className="space-y-4">
          <TableTabs value={tab} onChange={setTab} idPrefix="teacher-tab" />
          <div role="tabpanel" id="teacher-tab-panel" aria-labelledby={`teacher-tab-${tab}`}>
            {teacher ? <TeacherTable tableId={tab} submissions={teacher.submissions} /> : <p>Loading…</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

function ToggleButton(props: { on: boolean; busy: boolean; onLabel: string; offLabel: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={props.on}
      disabled={props.busy}
      onClick={props.onClick}
      className={`rounded-xl px-4 py-3 font-bold disabled:opacity-50 ${props.on ? 'bg-navy text-paper' : 'border-2 border-navy bg-white'}`}
    >
      {props.on ? props.onLabel : props.offLabel}
    </button>
  );
}
