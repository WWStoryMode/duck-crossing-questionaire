import type { ReactNode } from 'react';
import { SlideLayout } from './Slide';
import {
  ActivitySlide,
  ConclusionSlide,
  EVIDENCE_STEPS,
  EvidenceSlide,
  GameSlide,
  MechanicsSlide,
  OpeningSlide,
  OutcomeSlide,
} from './content';

/**
 * Presentation content. Edit slides here: each entry is self-contained.
 * `steps` = number of build steps (progressive reveal); omit for 1.
 */
export interface SlideNotes {
  points: string[];
  questions?: string[];
  misconceptions?: string[];
  transition?: string;
}

export interface SlideDef {
  id: string;
  title: string;
  /** Suggested time in seconds. */
  seconds: number;
  steps?: number;
  render: (ctx: { step: number }) => ReactNode;
  notes?: SlideNotes;
}

const placeholder = (title: string) => () => <SlideLayout title={title} />;

export const SLIDES: SlideDef[] = [
  { id: 'opening', title: 'Pedagogy and Game-Based Learning', seconds: 90, render: () => <OpeningSlide /> },
  { id: 'outcome', title: 'What are we learning today?', seconds: 60, render: () => <OutcomeSlide /> },
  { id: 'mechanics', title: 'From Learning Outcomes to Game Mechanics', seconds: 60, render: () => <MechanicsSlide /> },
  { id: 'game', title: 'Duck Crossing: A Game in Development', seconds: 60, render: () => <GameSlide /> },
  { id: 'activity', title: 'Which Mechanics Support Learning?', seconds: 285, render: () => <ActivitySlide /> },
  { id: 'results', title: 'What Did We Choose, and Why?', seconds: 165, render: placeholder('What Did We Choose, and Why?') },
  { id: 'evidence', title: 'How Do We Know Learning Has Happened?', seconds: 90, steps: EVIDENCE_STEPS, render: ({ step }) => <EvidenceSlide step={step} /> },
  { id: 'conclusion', title: 'Engagement Is Not Evidence of Learning', seconds: 45, render: () => <ConclusionSlide /> },
];

export const TOTAL_SECONDS = SLIDES.reduce((n, s) => n + s.seconds, 0);

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
