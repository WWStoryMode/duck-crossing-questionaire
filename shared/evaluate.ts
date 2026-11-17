import type { Answer, AnswerKey, Evaluation } from './types.js';

export function evaluate(key: AnswerKey, cardId: string, answer: Answer | undefined): Evaluation | null {
  const entry = key[cardId];
  if (!entry || !answer) return null;
  if (answer === entry.preferred) return 'match';
  if (entry.alternatives.includes(answer)) return 'discussion';
  return 'reconsider';
}

export const EVALUATION_LABELS: Record<Evaluation, { label: string; icon: string }> = {
  match: { label: 'Matches suggested answer', icon: '✓' },
  discussion: { label: 'Open for discussion', icon: '◐' },
  reconsider: { label: 'Reconsider', icon: '↺' },
};
