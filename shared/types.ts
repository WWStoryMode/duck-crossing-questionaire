export const ANSWERS = ['A', 'B', 'Both', 'Neither'] as const;
export type Answer = (typeof ANSWERS)[number];

export const ANSWER_LABELS: Record<Answer, string> = {
  A: 'A only',
  B: 'B only',
  Both: 'Both',
  Neither: 'Neither',
};

export type TableId = 1 | 2 | 3 | 4;
export const TABLE_IDS: TableId[] = [1, 2, 3, 4];

export type Evaluation = 'match' | 'discussion' | 'reconsider';

export interface Card {
  id: string; // e.g. "1.4"
  text: string;
}

export interface TableContent {
  id: TableId;
  title: string;
  outcomeA: string;
  outcomeB: string;
  cards: Card[];
}

export interface KeyEntry {
  preferred: Answer;
  alternatives: Answer[];
  explanation: string;
}

export type AnswerKey = Record<string, KeyEntry>;

export interface Submission {
  id: string;
  table: TableId;
  groupName: string;
  answers: Record<string, Answer>;
  debatableCardId: string;
  justification: string;
  isDemo: boolean;
  createdAt: number;
  updatedAt: number;
}

/** answer -> { real, demo } counts */
export type AnswerCounts = Record<Answer, { real: number; demo: number }>;

export interface PublicState {
  locked: boolean;
  revealed: boolean;
  /** cardId -> counts */
  counts: Record<string, AnswerCounts>;
  /** table -> number of submitted groups */
  groups: Record<TableId, { real: number; demo: number }>;
  /** only present once the teacher has revealed answers */
  key: AnswerKey | null;
}

export interface TeacherState {
  submissions: Submission[];
}

export interface SubmitPayload {
  submissionId?: string;
  table: TableId;
  groupName: string;
  answers: Record<string, Answer>;
  debatableCardId: string;
  justification: string;
}

export type SubmitAck =
  | { ok: true; submissionId: string; isNew: boolean }
  | { ok: false; error: string };
