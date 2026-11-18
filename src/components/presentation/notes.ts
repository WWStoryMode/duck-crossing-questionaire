import type { SlideNotes } from './slides';

/**
 * Presenter notes, keyed by slide id. Teacher-facing only (hidden by default).
 * Deliberately contains no answer-key content — answers come from the app's reveal.
 */
export const NOTES: Record<string, SlideNotes> = {
  opening: {
    points: [
      'Hook: a game can be fun and still not teach what we intend.',
      'Leave the opening question open — collect two or three answers, don’t resolve it yet.',
    ],
    questions: [
      'What did the player actually have to think about to score here?',
      'Would they cross safely if a cyclist ran the red light?',
    ],
    misconceptions: ['“The player crossed correctly, so they learnt road safety.” Reacting to green is recognition, not a safety judgement.'],
    transition: '“Let’s make that tension precise — here’s what we’re learning today.”',
  },
  outcome: {
    points: [
      'Read the outcome aloud; stress the two verbs: evaluate and justify.',
      'The three ideas are the lenses for the whole session.',
    ],
    questions: ['Can anyone think of a game they enjoyed but learnt little from?'],
    misconceptions: ['More features or realism automatically means more learning.'],
    transition: '“So how do we get from an outcome to a mechanic?”',
  },
  mechanics: {
    points: [
      'Walk the chain: objective → what the player does → what we can observe.',
      'Bloom’s describes kinds of thinking. A “Remember” mechanic is right for a “Remember” outcome — it is not a worse game.',
      'Contrast A (recognise) with B (evaluate): same game, different player actions.',
    ],
    questions: ['Which mechanic would give us evidence that a player can judge safety?'],
    misconceptions: ['Higher Bloom’s levels are always better design.', 'One mechanic fits every outcome.'],
    transition: '“Let’s try this on a real, unfinished game.”',
  },
  game: {
    points: [
      'Briefly introduce Duck Crossing; keep it under a minute.',
      'Emphasise it is unfinished — groups judge candidate mechanics, they do not design.',
    ],
    questions: ['What makes crossing with six ducklings harder than crossing alone?'],
    transition: '“Each table gets six candidate mechanics and two outcomes.”',
  },
  activity: {
    points: [
      'Point to the QR code; check every table has at least one device connected.',
      'Assign tables 1–4. Start the 4-minute countdown once groups are reading.',
      'There is no fixed number of mechanics per outcome.',
      'Circulate: ask groups which card they argued about most.',
      'The countdown does not lock submissions — lock from slide 6 or the dashboard when ready.',
    ],
    questions: ['What would the player have to do for this mechanic to show outcome B?'],
    misconceptions: ['“Both” is a safe default — push groups to say what each outcome needs from the player.'],
    transition: '“Let’s see what you chose — and why.”',
  },
  results: {
    points: [
      'Lock submissions first, then walk through one table at a time.',
      'Before revealing, ask a group to explain their most-split card.',
      'Reveal, then discuss: suggested answers are pedagogical interpretations, not the “right” answers.',
      'Use “open for discussion” answers as prompts, not corrections.',
      'With only one group on a table, ask that group to talk through their choices.',
      'Keys 1–4 switch tables. After reveal the cards scroll — use the mouse wheel or trackpad.',
    ],
    questions: ['Where did tables disagree, and what assumption caused it?', 'What would change your mind?'],
    transition: '“Agreeing on a match is still only a claim. How would we know it works?”',
  },
  evidence: {
    points: [
      'Press → to reveal each idea in turn; pause after each.',
      'Constructive alignment: objectives, activities and assessment should point the same way.',
      'Last build: evidence types, and usability ≠ learning effectiveness.',
      'Avoid claiming any mechanic is proven superior — we have argued, not tested.',
    ],
    questions: ['Which of these could you collect in a 20-minute playtest?'],
    misconceptions: ['“Players enjoyed it and finished it” as proof of learning.'],
    transition: '“So, to sum up…”',
  },
  conclusion: {
    points: [
      'Land the headline: engagement is not evidence of learning.',
      'Close with the reflection question — leave it open or take one answer.',
    ],
    questions: ['What would you need to observe before claiming Duck Crossing teaches road safety?'],
  },
};
