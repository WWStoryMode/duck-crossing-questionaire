import { useCallback, useEffect, useState } from 'react';
import { SLIDES } from '../components/presentation/slides';
import { Stage } from '../components/presentation/Slide';
import { SlideControls } from '../components/presentation/SlideControls';

type Pos = { index: number; step: number };

function stepsOf(i: number) {
  return SLIDES[i]?.steps ?? 1;
}

/** `#/3` (1-based) so a refresh keeps the current slide. */
function readHash(): Pos {
  const n = Number(window.location.hash.replace(/^#\/?/, ''));
  const index = Number.isInteger(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0;
  return { index, step: 0 };
}

/** Keys typed into form fields, tab lists, radio groups or dialogs belong to those controls. */
export function isInteractiveTarget(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t?.closest) return false;
  if (t.closest('input, textarea, select, [contenteditable="true"], [role="tablist"], [role="radiogroup"], [role="dialog"], [role="menu"]')) return true;
  if ((e.key === ' ' || e.key === 'Enter') && t.closest('button, a, summary')) return true;
  return false;
}

export function Presentation() {
  const [pos, setPos] = useState<Pos>(readHash);

  useEffect(() => {
    document.title = `${pos.index + 1}. ${SLIDES[pos.index].title} — Duck Crossing`;
    const hash = `#/${pos.index + 1}`;
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [pos.index]);

  useEffect(() => {
    const onHash = () => setPos(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const next = useCallback(
    () =>
      setPos(({ index, step }) => {
        if (step < stepsOf(index) - 1) return { index, step: step + 1 };
        if (index < SLIDES.length - 1) return { index: index + 1, step: 0 };
        return { index, step };
      }),
    [],
  );
  const prev = useCallback(
    () =>
      setPos(({ index, step }) => {
        if (step > 0) return { index, step: step - 1 };
        if (index > 0) return { index: index - 1, step: stepsOf(index - 1) - 1 };
        return { index, step };
      }),
    [],
  );
  const goTo = useCallback((index: number) => setPos({ index, step: 0 }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isInteractiveTarget(e)) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prev();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(SLIDES.length - 1);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, goTo]);

  const slide = SLIDES[pos.index];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EFE9DC]">
      <h1 className="sr-only">Duck Crossing presentation</h1>
      <main className="stage-area flex flex-1 items-center justify-center">
        <Stage label={`Slide ${pos.index + 1} of ${SLIDES.length}: ${slide.title}`}>{slide.render({ step: pos.step })}</Stage>
      </main>
      <footer className="flex justify-center border-t border-navy/10 bg-paper/95 px-3 py-2 text-navy">
        <SlideControls index={pos.index} step={pos.step} onPrev={prev} onNext={next} />
      </footer>
    </div>
  );
}
