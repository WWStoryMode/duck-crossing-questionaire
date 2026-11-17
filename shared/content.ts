import type { AnswerKey, TableContent, TableId } from './types.js';

export const GAME = {
  title: 'Duck Crossing',
  subtitle: 'A learning game in development',
  description: [
    'You play as a parent duck guiding six ducklings across busy roads to reach a pond.',
    'Along the journey, you encounter pedestrian signals, cars, cyclists and different crossing conditions.',
    'The challenge is to get the whole family across safely.',
    'The game is unfinished. The design team is still deciding how crossing, traffic behaviour, feedback, failure, flock management and winning should work.',
  ],
};

export const INSTRUCTIONS = [
  'Select your assigned table.',
  'Read Learning Outcomes A and B.',
  'Match each of the six mechanics to: A only, B only, Both or Neither.',
  'Discuss your choices.',
  'Select one debatable card and explain your reasoning.',
  'Submit your answers.',
];

export const DISCLAIMER =
  'These classifications are pedagogical interpretations, not scientifically established correct answers.';

export const TABLES: TableContent[] = [
  {
    id: 1,
    title: 'Crossing Decisions & Traffic',
    outcomeA: 'Identify pedestrian signals and expected traffic behaviour.',
    outcomeB: 'Assess whether it is safe to cross by considering signals, traffic and potential hazards.',
    cards: [
      { id: '1.1', text: 'The player presses a button when the pedestrian signal turns green.' },
      { id: '1.2', text: 'The player can look left and right to inspect traffic before deciding whether to cross.' },
      { id: '1.3', text: 'Vehicles always stop correctly at red lights.' },
      { id: '1.4', text: 'Some cyclists may pass through red lights, even when the pedestrian signal is green.' },
      { id: '1.5', text: 'The game highlights the pedestrian signal before each crossing.' },
      { id: '1.6', text: 'The player must decide whether to cross, wait or choose another crossing point.' },
    ],
  },
  {
    id: 2,
    title: 'Feedback & Failure Consequences',
    outcomeA: 'Recognise whether a crossing decision was correct or incorrect.',
    outcomeB: 'Explain why a decision was unsafe and use that understanding to improve the next attempt.',
    cards: [
      { id: '2.1', text: 'Correct decisions earn 10 points; incorrect decisions lose 10 points.' },
      { id: '2.2', text: 'After an incorrect decision, the game explains which hazard the player overlooked.' },
      { id: '2.3', text: 'Any collision causes an immediate game over.' },
      { id: '2.4', text: 'After a collision, the player restarts the crossing with a time penalty.' },
      { id: '2.5', text: 'After an unsafe decision, the game replays the situation and asks the player to identify the mistake.' },
      { id: '2.6', text: 'The player encounters a similar situation with different traffic and must choose again.' },
    ],
  },
  {
    id: 3,
    title: 'Flock Management & Winning',
    outcomeA: 'Guide all ducklings together across the road successfully.',
    outcomeB: 'Evaluate how flock size, speed and timing can minimise crossing risks.',
    cards: [
      { id: '3.1', text: 'All six ducklings automatically follow the parent in a line.' },
      { id: '3.2', text: 'The player can choose how many ducklings to escort across at one time.' },
      { id: '3.3', text: 'A larger flock takes longer to cross the road.' },
      { id: '3.4', text: 'The player wins when all ducklings reach the destination.' },
      { id: '3.5', text: 'The player earns bonus points for completing the crossing quickly.' },
      { id: '3.6', text: 'The player must complete several different crossing situations without making unsafe decisions.' },
    ],
  },
  {
    id: 4,
    title: 'Observation & Difficulty',
    outcomeA: 'Identify basic road hazards and apply a familiar crossing procedure.',
    outcomeB: 'Adapt crossing decisions to unfamiliar situations involving multiple hazards.',
    cards: [
      { id: '4.1', text: 'The player repeatedly encounters the same pedestrian crossing.' },
      { id: '4.2', text: 'Players can inspect approaching vehicles and areas hidden behind parked cars.' },
      { id: '4.3', text: 'The game introduces new hazards one at a time.' },
      { id: '4.4', text: 'Later levels combine cyclists, obstructed views and slow-moving ducklings.' },
      { id: '4.5', text: 'Every new level reduces the time available to cross.' },
      { id: '4.6', text: 'The player must identify potential hazards before deciding which route to take.' },
    ],
  },
];

export function getTable(id: TableId): TableContent {
  return TABLES.find((t) => t.id === id)!;
}

export function findCard(cardId: string) {
  for (const t of TABLES) {
    const card = t.cards.find((c) => c.id === cardId);
    if (card) return { table: t, card };
  }
  return null;
}

/** Server-only in practice: sent to clients only after the teacher reveals. */
export const ANSWER_KEY: AnswerKey = {
  // Table 1
  '1.1': { preferred: 'A', alternatives: [], explanation: 'Pressing on green rehearses recognising the signal, but involves no judgement about whether crossing is actually safe.' },
  '1.2': { preferred: 'B', alternatives: ['Both'], explanation: 'Looking both ways gathers evidence for a safety judgement (B); it can also support noticing how traffic behaves (A).' },
  '1.3': { preferred: 'A', alternatives: ['Neither'], explanation: 'Perfectly obedient vehicles model expected behaviour (A), but they remove real risk — some argue this teaches neither outcome well.' },
  '1.4': { preferred: 'B', alternatives: [], explanation: 'A green signal is not a guarantee: rule-breaking cyclists force players to assess hazards beyond the signal.' },
  '1.5': { preferred: 'A', alternatives: [], explanation: 'Highlighting draws attention to the signal for identification, but does the noticing for the player rather than asking them to judge.' },
  '1.6': { preferred: 'B', alternatives: ['Both'], explanation: 'Choosing to cross, wait or reroute is the safety assessment itself; it can also draw on reading signals (A).' },
  // Table 2
  '2.1': { preferred: 'A', alternatives: [], explanation: 'Points tell players whether they were right or wrong, but not why — so they support recognition only.' },
  '2.2': { preferred: 'Both', alternatives: [], explanation: 'Naming the overlooked hazard confirms the decision was wrong (A) and explains why it was unsafe (B).' },
  '2.3': { preferred: 'A', alternatives: ['Neither'], explanation: 'Game over clearly signals failure (A), but offers no explanation or second attempt — arguably it supports neither.' },
  '2.4': { preferred: 'A', alternatives: ['Neither'], explanation: 'Restarting with a penalty marks the error (A) but does not explain it; a time penalty may even encourage rushing.' },
  '2.5': { preferred: 'Both', alternatives: [], explanation: 'Replaying and asking the player to find the mistake confirms the error and builds explanation for next time.' },
  '2.6': { preferred: 'B', alternatives: ['Neither'], explanation: 'A varied re-attempt lets players apply what they learned (B); without prior explanation it may be trial-and-error (Neither).' },
  // Table 3
  '3.1': { preferred: 'A', alternatives: ['Neither'], explanation: 'Automatic following keeps the flock together (A), but removes player agency — some argue it teaches neither outcome.' },
  '3.2': { preferred: 'Both', alternatives: ['B'], explanation: 'Choosing group size is part of guiding the family across (A) and a direct trade-off to evaluate (B).' },
  '3.3': { preferred: 'B', alternatives: ['Neither'], explanation: 'Slower large flocks create a size–time trade-off to evaluate (B); on its own it is just a rule unless players must act on it.' },
  '3.4': { preferred: 'A', alternatives: [], explanation: 'The win condition directly reflects getting all ducklings across, but says nothing about how risks were weighed.' },
  '3.5': { preferred: 'Neither', alternatives: [], explanation: 'Speed bonuses reward rushing, which works against safe, deliberate crossing in both outcomes.' },
  '3.6': { preferred: 'B', alternatives: ['Neither'], explanation: 'Varied situations require evaluating risk repeatedly (B); a strict no-mistakes rule may discourage experimenting (Neither).' },
  // Table 4
  '4.1': { preferred: 'A', alternatives: [], explanation: 'Repetition builds a familiar procedure (A) but offers no unfamiliar situations to adapt to.' },
  '4.2': { preferred: 'Both', alternatives: ['B'], explanation: 'Inspecting traffic and hidden areas identifies basic hazards (A) and supports judgement in complex scenes (B).' },
  '4.3': { preferred: 'A', alternatives: [], explanation: 'Introducing hazards one at a time scaffolds identification of basic hazards before they are combined.' },
  '4.4': { preferred: 'B', alternatives: [], explanation: 'Combining several hazards creates the unfamiliar, multi-hazard situations that require adaptation.' },
  '4.5': { preferred: 'Neither', alternatives: [], explanation: 'Shrinking time limits raise pressure rather than complexity, and can reward hasty decisions.' },
  '4.6': { preferred: 'Both', alternatives: ['B'], explanation: 'Identifying hazards before choosing a route applies basic recognition (A) and adapts the decision to the situation (B).' },
};
