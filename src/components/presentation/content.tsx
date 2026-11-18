import type { ReactNode } from 'react';
import { GAME } from '../../../shared/content.js';
import { DuckFamily } from '../Duck';
import { SlideLayout } from './Slide';
import { StreetScene } from './StreetScene';

/* Small presentational helpers (all sized in cqw). */

export function Callout({ label, children, tone = 'sun' }: { label: string; children: ReactNode; tone?: 'sun' | 'moss' | 'navy' }) {
  const tones = {
    sun: 'bg-sun-light border-sun',
    moss: 'bg-moss-light border-moss',
    navy: 'bg-navy text-paper border-navy',
  };
  return (
    <div className={`rounded-[1.4cqw] border-l-[0.8cqw] p-[2cqw] ${tones[tone]}`}>
      <p className="s-kicker opacity-80">{label}</p>
      <div className="mt-[0.6cqw]">{children}</div>
    </div>
  );
}

function Arrow({ dir = 'down' }: { dir?: 'down' | 'right' }) {
  return (
    <span aria-hidden className="s-h2 block text-center leading-none text-moss">
      {dir === 'down' ? '↓' : '→'}
    </span>
  );
}

/* ---------- Slide 1 ---------- */
export function OpeningSlide() {
  return (
    <div className="s-pad flex h-full flex-col">
      <p className="s-kicker text-moss">Microteaching · Matching Game Mechanics to Learning Outcomes</p>
      <h2 className="s-title mt-[1cqw] max-w-[80%] text-[5.2cqw]">Pedagogy and Game-Based Learning</h2>
      <p className="s-lead mt-[1.2cqw] font-semibold text-navy-light">Can a game be entertaining but fail to teach?</p>
      <div className="mt-auto">
        <Callout label="Discuss">
          <p className="s-lead font-semibold">
            “If a game rewards players for crossing when the pedestrian signal turns green, have they learnt how to cross safely?”
          </p>
        </Callout>
      </div>
      <DuckFamily className="absolute right-[5cqw] top-[5cqw] w-[26cqw]" />
    </div>
  );
}

/* ---------- Slide 2 ---------- */
export function OutcomeSlide() {
  const ideas = [
    'Different learning outcomes require different player actions.',
    'More complex mechanics are not necessarily better.',
    'Game performance is not automatically evidence of learning.',
  ];
  return (
    <SlideLayout kicker="Today’s learning outcome" title="What are we learning today?">
      <Callout label="By the end of this session you can" tone="navy">
        <p className="s-lead font-semibold">
          Evaluate whether game mechanics support specific learning outcomes, and justify the judgement using pedagogical principles.
        </p>
      </Callout>
      <ul className="mt-[2.5cqw] grid grid-cols-3 gap-[2cqw]">
        {ideas.map((t, i) => (
          <li key={t} className="rounded-[1.2cqw] border border-navy/10 bg-white p-[1.8cqw] shadow-sm">
            <span className="s-h2 block text-moss">{i + 1}</span>
            <span className="s-body mt-[0.5cqw] block font-semibold">{t}</span>
          </li>
        ))}
      </ul>
    </SlideLayout>
  );
}

/* ---------- Slide 3 ---------- */
const BLOOM = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'];

export function MechanicsSlide() {
  return (
    <SlideLayout title="From Learning Outcomes to Game Mechanics" titleClass="text-[3.6cqw]">
      <div className="grid flex-1 grid-cols-[0.75fr_1.7fr] gap-[3cqw]">
        <ol className="flex flex-col justify-center gap-[0.6cqw]" aria-label="From objective to evidence">
          {['Learning Objective', 'Player Action / Game Mechanic', 'Evidence of Learning'].map((t, i) => (
            <li key={t}>
              {i > 0 && <Arrow />}
              <span className={`s-body block rounded-[1.2cqw] p-[1.4cqw] text-center font-bold ${i === 1 ? 'bg-sun' : 'bg-moss-light'}`}>{t}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-[1.2cqw]">
          <div>
            <p className="s-small font-bold">Bloom’s Taxonomy: kinds of thinking a mechanic can ask for</p>
            <ol className="mt-[0.6cqw] flex flex-wrap items-center gap-[0.6cqw]" aria-label="Bloom's Taxonomy levels">
              {BLOOM.map((b, i) => (
                <li key={b} className="s-tiny flex items-center gap-[0.4cqw]">
                  <span className={`rounded-full px-[0.9cqw] py-[0.25cqw] font-bold ${b === 'Remember' || b === 'Evaluate' ? 'bg-navy text-paper' : 'bg-white ring-1 ring-navy/20'}`}>{b}</span>
                  {i < BLOOM.length - 1 && <span aria-hidden>→</span>}
                </li>
              ))}
            </ol>
            <p className="s-tiny mt-[0.5cqw] italic">Levels of thinking — not a ranking of game quality.</p>
          </div>
          {[
            { o: 'Outcome A', t: 'Recognise the pedestrian signal.', m: 'Press a button when the pedestrian signal turns green.', tone: 'bg-moss-light' },
            { o: 'Outcome B', t: 'Evaluate whether crossing is safe.', m: 'Observe approaching traffic and decide whether to cross or wait.', tone: 'bg-sun-light' },
          ].map((r) => (
            <div key={r.o} className={`grid grid-cols-[1fr_auto_1.2fr] items-center gap-[1.2cqw] rounded-[1.2cqw] px-[1.4cqw] py-[1cqw] ${r.tone}`}>
              <p className="s-body">
                <strong className="s-small block uppercase tracking-wide">{r.o}</strong>
                {r.t}
              </p>
              <Arrow dir="right" />
              <p className="s-body">
                <strong className="s-small block uppercase tracking-wide">Possible mechanic</strong>
                {r.m}
              </p>
            </div>
          ))}
          <p className="s-body font-bold">The right mechanic depends on the learning objective.</p>
        </div>
      </div>
    </SlideLayout>
  );
}

/* ---------- Slide 4 ---------- */
export function GameSlide() {
  const features = ['Pedestrian crossings', 'Traffic signals', 'Cars and cyclists', 'Different crossing conditions', 'Flock management', 'Decisions and consequences'];
  return (
    <SlideLayout kicker={GAME.subtitle} title="Duck Crossing: A Game in Development">
      <div className="grid flex-1 grid-cols-[1.1fr_1fr] items-center gap-[3cqw]">
        <StreetScene className="w-full rounded-[1.4cqw] shadow-md" />
        <div className="flex flex-col gap-[1.5cqw]">
          <p className="s-body font-semibold">{GAME.description[0]}</p>
          <ul className="s-small grid grid-cols-2 gap-x-[1.5cqw] gap-y-[0.5cqw]">
            {features.map((f) => (
              <li key={f} className="flex gap-[0.6cqw]">
                <span aria-hidden className="text-moss">●</span>
                {f}
              </li>
            ))}
          </ul>
          <Callout label="The game is unfinished">
            <p className="s-small">
              The design team hasn’t decided how crossing, feedback, failure, flock management and winning should work. You’ll examine
              possible <strong>mechanics</strong> — not design a new game.
            </p>
          </Callout>
        </div>
      </div>
    </SlideLayout>
  );
}
