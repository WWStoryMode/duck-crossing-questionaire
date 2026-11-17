import { ANSWER_KEY, TABLES } from '../shared/content.js';
import { evaluate } from '../shared/evaluate.js';
import { ANSWERS } from '../shared/types.js';

let errors = 0;
const fail = (m: string) => { console.error('✗', m); errors++; };
const ids = TABLES.flatMap((t) => t.cards.map((c) => c.id));
if (ids.length !== 24) fail(`expected 24 cards, got ${ids.length}`);
for (const id of ids) {
  const k = ANSWER_KEY[id];
  if (!k) { fail(`no key for ${id}`); continue; }
  if (!k.explanation) fail(`no explanation for ${id}`);
  if (evaluate(ANSWER_KEY, id, k.preferred) !== 'match') fail(`${id} preferred`);
  for (const a of k.alternatives) if (evaluate(ANSWER_KEY, id, a) !== 'discussion') fail(`${id} alt ${a}`);
  for (const a of ANSWERS) if (a !== k.preferred && !k.alternatives.includes(a) && evaluate(ANSWER_KEY, id, a) !== 'reconsider') fail(`${id} ${a}`);
}
const alts = ids.filter((id) => ANSWER_KEY[id].alternatives.length).join(' ');
console.log('cards with alternatives:', alts);
if (errors) process.exit(1);
console.log('✓ content OK');
