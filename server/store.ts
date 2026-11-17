import { randomUUID, timingSafeEqual, createHash } from 'node:crypto';
import { ANSWER_KEY, TABLES, getTable } from '../shared/content.js';
import {
  ANSWERS,
  TABLE_IDS,
  type Answer,
  type AnswerCounts,
  type PublicState,
  type Submission,
  type SubmitPayload,
  type TableId,
  type TeacherState,
} from '../shared/types.js';

/**
 * The single classroom session. Lives only in this process's memory:
 * nothing is written to disk, and everything is lost on restart.
 */
const session = {
  submissions: new Map<string, Submission>(),
  locked: false,
  revealed: false,
};

const teacherTokens = new Set<string>();

// ---------- teacher auth ----------

const TEACHER_CODE = process.env.TEACHER_CODE || 'duck';
if (!process.env.TEACHER_CODE) {
  console.warn('[duck-crossing] TEACHER_CODE not set — using the default code "duck". Set TEACHER_CODE before class!');
}

function digest(s: string) {
  return createHash('sha256').update(s).digest();
}

export function loginTeacher(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  if (!timingSafeEqual(digest(code.trim()), digest(TEACHER_CODE))) return null;
  const token = randomUUID();
  teacherTokens.add(token);
  return token;
}

export function isTeacher(token: unknown): boolean {
  return typeof token === 'string' && teacherTokens.has(token);
}

// ---------- submissions ----------

const MAX_NAME = 60;
const MAX_JUSTIFICATION = 1000;

function clean(s: unknown, max: number) {
  return typeof s === 'string' ? s.trim().slice(0, max) : '';
}

export type SubmitResult =
  | { ok: true; submission: Submission; isNew: boolean }
  | { ok: false; error: string };

export function validate(p: unknown): { ok: true; value: SubmitPayload } | { ok: false; error: string } {
  if (!p || typeof p !== 'object') return { ok: false, error: 'Invalid submission.' };
  const raw = p as Record<string, unknown>;
  const table = Number(raw.table) as TableId;
  if (!TABLE_IDS.includes(table)) return { ok: false, error: 'Please choose a table.' };
  const cards = getTable(table).cards;
  const rawAnswers = (raw.answers ?? {}) as Record<string, unknown>;
  const answers: Record<string, Answer> = {};
  for (const card of cards) {
    const a = rawAnswers[card.id];
    if (typeof a !== 'string' || !ANSWERS.includes(a as Answer)) {
      return { ok: false, error: 'Please classify all six mechanics before submitting.' };
    }
    answers[card.id] = a as Answer;
  }
  const debatable = clean(raw.debatableCardId, 10);
  return {
    ok: true,
    value: {
      submissionId: typeof raw.submissionId === 'string' ? raw.submissionId : undefined,
      table,
      groupName: clean(raw.groupName, MAX_NAME),
      answers,
      debatableCardId: cards.some((c) => c.id === debatable) ? debatable : '',
      justification: clean(raw.justification, MAX_JUSTIFICATION),
    },
  };
}

/** Create or update a submission. An unknown/missing ID creates a new one. */
export function upsertSubmission(p: SubmitPayload, isDemo = false): SubmitResult {
  if (session.locked && !isDemo) return { ok: false, error: 'Submissions are locked by the teacher.' };
  const now = Date.now();
  const existing = p.submissionId ? session.submissions.get(p.submissionId) : undefined;
  if (existing && !existing.isDemo) {
    Object.assign(existing, {
      table: p.table,
      groupName: p.groupName,
      answers: p.answers,
      debatableCardId: p.debatableCardId,
      justification: p.justification,
      updatedAt: now,
    });
    return { ok: true, submission: existing, isNew: false };
  }
  const submission: Submission = {
    id: randomUUID(),
    table: p.table,
    groupName: p.groupName,
    answers: p.answers,
    debatableCardId: p.debatableCardId,
    justification: p.justification,
    isDemo,
    createdAt: now,
    updatedAt: now,
  };
  session.submissions.set(submission.id, submission);
  return { ok: true, submission, isNew: true };
}

// ---------- teacher controls ----------

export function setLocked(v: boolean) { session.locked = !!v; }
export function setRevealed(v: boolean) { session.revealed = !!v; }

export function resetSession() {
  session.submissions.clear();
  session.locked = false;
  session.revealed = false;
}

export function clearDemo() {
  for (const [id, s] of session.submissions) if (s.isDemo) session.submissions.delete(id);
}

// ---------- views ----------

export function publicState(): PublicState {
  const counts: PublicState['counts'] = {};
  for (const t of TABLES) {
    for (const c of t.cards) {
      counts[c.id] = Object.fromEntries(ANSWERS.map((a) => [a, { real: 0, demo: 0 }])) as AnswerCounts;
    }
  }
  const groups = Object.fromEntries(TABLE_IDS.map((t) => [t, { real: 0, demo: 0 }])) as PublicState['groups'];
  for (const s of session.submissions.values()) {
    const kind = s.isDemo ? 'demo' : 'real';
    groups[s.table][kind]++;
    for (const [cardId, a] of Object.entries(s.answers)) counts[cardId][a][kind]++;
  }
  return {
    locked: session.locked,
    revealed: session.revealed,
    counts,
    groups,
    key: session.revealed ? ANSWER_KEY : null,
  };
}

export function teacherState(): TeacherState {
  const submissions = [...session.submissions.values()].sort((a, b) => a.createdAt - b.createdAt);
  return { submissions };
}

// ---------- demo mode ----------

/** Placeholder until milestone 2.3. */
export function addDemoSubmissions() {}
