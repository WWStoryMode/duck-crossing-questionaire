import { useState } from 'react';
import { usePublicState } from '../../socket';
import { teacherAction } from '../../teacher';
import { usePresentation } from './context';

/** Reveal/Hide + Lock/Unlock using the existing server-side teacher events. Only rendered once signed in. */
export function TeacherControls() {
  const { state } = usePublicState();
  const { teacherAuthed, requestSignIn, onAuthLost } = usePresentation();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const locked = !!state?.locked;
  const revealed = !!state?.revealed;

  if (!teacherAuthed) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="ctl-btn" onClick={requestSignIn}>
          🔑 Sign in to reveal answers
        </button>
        <a href="/teacher" target="_blank" rel="noopener" className="ctl-btn">Dashboard ↗</a>
      </div>
    );
  }

  const run = async (name: string, event: string, arg: boolean) => {
    setBusy(name);
    setError('');
    try {
      await teacherAction(event, arg);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      if (msg === 'Not authorised.') onAuthLost();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="ctl-btn" aria-pressed={locked} disabled={!!busy || !state} onClick={() => run('lock', 'teacher:lock', !locked)}>
        {locked ? '🔒 Locked — Unlock' : '🔓 Open — Lock submissions'}
      </button>
      <button type="button" className="ctl-btn" aria-pressed={revealed} disabled={!!busy || !state} onClick={() => run('reveal', 'teacher:reveal', !revealed)}>
        {revealed ? '👁 Revealed — Hide answers' : '🙈 Hidden — Reveal answers'}
      </button>
      <a href="/teacher" target="_blank" rel="noopener" className="ctl-btn">Dashboard ↗</a>
      {error && <span role="alert" className="rounded bg-sun-light px-2 py-1 text-sm font-semibold">⚠ {error}</span>}
    </div>
  );
}
