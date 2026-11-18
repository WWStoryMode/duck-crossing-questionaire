import type { ReactNode } from 'react';
import { formatDuration, SLIDES } from './slides';

type Props = {
  index: number;
  step: number;
  onPrev: () => void;
  onNext: () => void;
  children?: ReactNode;
};

/** Bottom control bar: Prev / slide counter / Next, plus any extra controls. */
export function SlideControls({ index, step, onPrev, onNext, children }: Props) {
  const slide = SLIDES[index];
  const steps = slide.steps ?? 1;
  const atStart = index === 0 && step === 0;
  const atEnd = index === SLIDES.length - 1 && step === steps - 1;
  return (
    <nav aria-label="Slide controls" className="flex flex-wrap items-center gap-2 text-sm">
      <button type="button" onClick={onPrev} disabled={atStart} className="ctl-btn" aria-label="Previous slide">
        ← Prev
      </button>
      <p className="min-w-[9rem] text-center font-bold" aria-live="polite">
        Slide {index + 1} / {SLIDES.length}
        {steps > 1 && <span className="font-medium"> · {step + 1}/{steps}</span>}
        <span className="block text-xs font-medium opacity-80">Suggested {formatDuration(slide.seconds)}</span>
      </p>
      <button type="button" onClick={onNext} disabled={atEnd} className="ctl-btn" aria-label="Next slide">
        Next →
      </button>
      {children}
    </nav>
  );
}
