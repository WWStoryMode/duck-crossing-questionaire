import { useEffect, useState } from 'react';
import type { TeacherState } from '../shared/types.js';
import { emitAck, socket } from './socket';

/** Teacher session token: kept in page memory only. */
let token: string | null = null;

export async function login(code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/teacher/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const body = await res.json();
    if (!body.ok) return { ok: false, error: body.error || 'Incorrect access code.' };
    token = body.token;
    socket.auth = { token }; // future reconnects authenticate automatically
    const ack = await emitAck<{ ok: boolean; error?: string }>('teacher:auth', token);
    return ack.ok ? { ok: true } : { ok: false, error: ack.error || 'Not authorised.' };
  } catch {
    return { ok: false, error: 'Could not reach the server.' };
  }
}

/** Live teacher state. `expired` becomes true if the server forgot our token (e.g. after a restart). */
export function useTeacherState() {
  const [state, setState] = useState<TeacherState | null>(null);
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const onState = (s: TeacherState) => setState(s);
    const onConnect = async () => {
      if (!token) return;
      try {
        const ack = await emitAck<{ ok: boolean }>('teacher:auth', token);
        if (!ack.ok) setExpired(true);
      } catch {
        /* will retry on next connect */
      }
    };
    socket.on('state:teacher', onState);
    socket.on('connect', onConnect);
    return () => {
      socket.off('state:teacher', onState);
      socket.off('connect', onConnect);
    };
  }, []);
  return { state, expired };
}

export async function teacherAction(event: string, arg?: unknown) {
  const res = arg === undefined
    ? await emitAck<{ ok: boolean; error?: string }>(event)
    : await emitAck<{ ok: boolean; error?: string }>(event, arg);
  if (!res.ok) throw new Error(res.error || 'Action failed');
}
