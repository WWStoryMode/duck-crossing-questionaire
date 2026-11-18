import { useCallback, useEffect, useRef, useState } from 'react';
import { SLIDES } from '../components/presentation/slides';
import { Stage } from '../components/presentation/Slide';
import { SlideControls } from '../components/presentation/SlideControls';
import { Overview } from '../components/presentation/Overview';
import { NavMenu } from '../components/presentation/NavMenu';
import { PresenterNotes } from '../components/presentation/PresenterNotes';
import { usePublicState } from '../socket';
import { isInteractiveTarget } from '../components/presentation/keys';
import { PresentationContext } from '../components/presentation/context';
import type { TableId } from '../../shared/types.js';
import { SignInDialog } from '../components/presentation/SignInDialog';
import { useTeacherState } from '../teacher';

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

function useFullscreen() {
  const [isFs, setIsFs] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const on = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggle = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);
  return { isFs, toggle };
}

/** True after `ms` without mouse/keyboard activity. */
function useIdle(enabled: boolean, ms = 3000) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!enabled) return setIdle(false);
    let t = window.setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setIdle(true), ms);
    };
    window.addEventListener('mousemove', wake);
    window.addEventListener('keydown', wake);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('keydown', wake);
    };
  }, [enabled, ms]);
  return idle;
}

export function Presentation() {
  const [pos, setPos] = useState<Pos>(readHash);
  const [overview, setOverview] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [liveTable, setLiveTable] = useState<TableId>(1);
  const [teacherAuthed, setTeacherAuthed] = useState(false);
  const [signIn, setSignIn] = useState<{ message?: string } | null>(null);
  const { expired } = useTeacherState();

  // Server forgot our token (e.g. restart): drop teacher controls and ask again.
  useEffect(() => {
    if (expired && teacherAuthed) {
      setTeacherAuthed(false);
      setSignIn({ message: 'Your teacher session expired (the server may have restarted). Please enter the code again.' });
    }
  }, [expired, teacherAuthed]);
  const requestSignIn = useCallback(() => setSignIn({}), []);
  const onAuthLost = useCallback(() => {
    setTeacherAuthed(false);
    setSignIn({ message: 'Teacher session expired. Please enter the code again.' });
  }, []);
  const { isFs, toggle: toggleFs } = useFullscreen();
  const idle = useIdle(isFs);
  const footerRef = useRef<HTMLElement>(null);

  // In fullscreen, let the control bar fade once idle: drop focus that was left on a control.
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (idle && el && footerRef.current?.contains(el)) el.blur();
  }, [idle]);
  const { connected } = usePublicState();

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
      if (overview || signIn) return;
      switch (e.key) {
        case 'f':
        case 'F':
          toggleFs();
          break;
        case 'o':
        case 'O':
          setOverview(true);
          break;
        case 'n':
        case 'N':
          setNotesOpen((v) => !v);
          break;
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
  }, [next, prev, goTo, overview, signIn, toggleFs]);

  const slide = SLIDES[pos.index];

  return (
    <PresentationContext.Provider value={{ liveTable, setLiveTable, teacherAuthed, requestSignIn, onAuthLost }}>
      <div className="relative flex h-screen flex-col overflow-hidden bg-[#EFE9DC]">
        <h1 className="sr-only">Duck Crossing presentation</h1>
        <div className="flex min-h-0 flex-1">
          <main className="stage-area flex min-w-0 flex-1 items-center justify-center">
            <Stage label={`Slide ${pos.index + 1} of ${SLIDES.length}: ${slide.title}`}>{slide.render({ step: pos.step })}</Stage>
          </main>
          {notesOpen && <PresenterNotes slide={slide} index={pos.index} onClose={() => setNotesOpen(false)} />}
        </div>
        <footer
          ref={footerRef}
          className={`flex flex-wrap items-center justify-center gap-2 px-3 py-2 text-navy transition-opacity duration-300 ${
            isFs
              ? `absolute inset-x-0 bottom-0 bg-paper/90 hover:opacity-100 has-[:focus-visible]:opacity-100 ${idle ? 'opacity-0' : 'opacity-100'}`
              : 'border-t border-navy/10 bg-paper'
          }`}
        >
          <SlideControls index={pos.index} step={pos.step} onPrev={prev} onNext={next}>
            <button type="button" className="ctl-btn" onClick={() => setOverview(true)} aria-keyshortcuts="O">
              ▦ Overview
            </button>
            <button type="button" className="ctl-btn" onClick={() => setNotesOpen((v) => !v)} aria-pressed={notesOpen} aria-keyshortcuts="N">
              ✎ Notes
            </button>
            <button type="button" className="ctl-btn" onClick={toggleFs} aria-pressed={isFs} aria-keyshortcuts="F">
              {isFs ? '⤡ Exit fullscreen' : '⤢ Fullscreen'}
            </button>
            <span
              role="status"
              className={`rounded-full px-3 py-1 text-xs font-bold ${connected ? 'bg-moss-light' : 'bg-sun'}`}
            >
              {connected ? '● Live' : '○ Offline — reconnecting…'}
            </span>
            {teacherAuthed ? (
              <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-paper">✓ Teacher</span>
            ) : (
              <button type="button" className="ctl-btn" onClick={requestSignIn}>
                🔑 Sign in
              </button>
            )}
            <NavMenu />
          </SlideControls>
        </footer>
        {signIn && (
          <SignInDialog
            message={signIn.message}
            onClose={() => setSignIn(null)}
            onSuccess={() => {
              setTeacherAuthed(true);
              setSignIn(null);
            }}
          />
        )}
        {overview && (
          <Overview
            current={pos.index}
            onPick={(i) => {
              goTo(i);
              setOverview(false);
            }}
            onClose={() => setOverview(false)}
          />
        )}
      </div>
    </PresentationContext.Provider>
  );
}
