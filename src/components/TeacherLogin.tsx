import { useState, type FormEvent } from 'react';
import { login } from '../teacher';

/** Access-code form using the existing server-side teacher login (src/teacher.ts). */
export function TeacherLoginForm({ onSuccess, message, autoFocus = true }: { onSuccess: () => void; message?: string; autoFocus?: boolean }) {
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
    <form onSubmit={submit} className="mt-6 space-y-3">
      <label htmlFor="code" className="block font-bold">Access code</label>
      <input
        id="code"
        type="password"
        autoFocus={autoFocus}
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
  );
}
