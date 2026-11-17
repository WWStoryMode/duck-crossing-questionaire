import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import type { SubmitAck } from '../shared/types.js';
import {
  addDemoSubmissions,
  clearDemo,
  isTeacher,
  publicState,
  resetSession,
  setLocked,
  setRevealed,
  teacherState,
  upsertSubmission,
  validate,
} from './store.js';

type Ack = (res: { ok: boolean; error?: string }) => void;
const noop = () => {};

/** If a socket created a submission within this window, a second "new" submit reuses it (double-click guard). */
const DOUBLE_SUBMIT_MS = 5000;

export function attachSockets(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    pingInterval: 10000,
    pingTimeout: 8000,
  });

  const broadcast = () => {
    io.emit('state:public', publicState());
    io.to('teacher').emit('state:teacher', teacherState());
  };

  function joinTeacher(socket: Socket) {
    socket.data.teacher = true;
    socket.join('teacher');
    socket.emit('state:teacher', teacherState());
  }

  io.on('connection', (socket) => {
    // Every (re)connection gets a fresh copy of current server memory.
    socket.emit('state:public', publicState());
    if (isTeacher(socket.handshake.auth?.token)) joinTeacher(socket);

    socket.on('teacher:auth', (token: unknown, maybeAck?: unknown) => {
      const ack = (typeof maybeAck === 'function' ? maybeAck : noop) as Ack;
      if (!isTeacher(token)) return ack({ ok: false, error: 'Not authorised.' });
      joinTeacher(socket);
      ack({ ok: true });
    });

    // ---------- student ----------
    let inFlight = false;
    let lastCreated: { id: string; at: number } | null = null;

    socket.on('student:submit', (payload: unknown, maybeAck?: unknown) => {
      const ack = (typeof maybeAck === 'function' ? maybeAck : noop) as (r: SubmitAck) => void;
      if (inFlight) return ack({ ok: false, error: 'Already submitting…' });
      inFlight = true;
      try {
        const v = validate(payload);
        if (!v.ok) return ack(v);
        const p = v.value;
        if (!p.submissionId && lastCreated && Date.now() - lastCreated.at < DOUBLE_SUBMIT_MS) {
          p.submissionId = lastCreated.id;
        }
        const r = upsertSubmission(p);
        if (!r.ok) return ack(r);
        if (r.isNew) lastCreated = { id: r.submission.id, at: Date.now() };
        ack({ ok: true, submissionId: r.submission.id, isNew: r.isNew });
        broadcast();
      } finally {
        inFlight = false;
      }
    });

    // ---------- teacher ----------
    const teacherOnly =
      <T>(fn: (arg: T) => void) =>
      (...args: unknown[]) => {
        // Supports both emit(ev, arg, ack) and emit(ev, ack).
        const last = args[args.length - 1];
        const ack: Ack = typeof last === 'function' ? (last as Ack) : noop;
        const arg = (typeof args[0] === 'function' ? undefined : args[0]) as T;
        if (!socket.data.teacher) return ack({ ok: false, error: 'Not authorised.' });
        fn(arg);
        ack({ ok: true });
        broadcast();
      };

    socket.on('teacher:lock', teacherOnly<boolean>((v) => setLocked(v)));
    socket.on('teacher:reveal', teacherOnly<boolean>((v) => setRevealed(v)));
    socket.on(
      'teacher:reset',
      teacherOnly<void>(() => {
        resetSession();
        io.emit('session:reset');
      }),
    );
    socket.on('teacher:addDemo', teacherOnly<void>(() => addDemoSubmissions()));
    socket.on('teacher:clearDemo', teacherOnly<void>(() => clearDemo()));
  });

  return io;
}
