/**
 * End-to-end check against a running server:
 *   TEACHER_CODE=test PORT=3999 npm start   (in another terminal)
 *   SMOKE_URL=http://localhost:3999 TEACHER_CODE=test npm run smoke
 */
import { io, type Socket } from 'socket.io-client';
import type { PublicState, SubmitAck, TeacherState } from '../shared/types.js';

const URL = process.env.SMOKE_URL || 'http://localhost:3000';
const CODE = process.env.TEACHER_CODE || 'duck';
let failures = 0;
const check = (cond: unknown, msg: string) => {
  console.log(cond ? '✓' : '✗', msg);
  if (!cond) failures++;
};

function connect(auth?: object): Promise<{ s: Socket; latest: { pub?: PublicState; teacher?: TeacherState } }> {
  return new Promise((resolve) => {
    const s = io(URL, { auth, transports: ['websocket'] });
    const latest: { pub?: PublicState; teacher?: TeacherState } = {};
    s.on('state:public', (p) => (latest.pub = p));
    s.on('state:teacher', (t) => (latest.teacher = t));
    s.once('state:public', () => resolve({ s, latest }));
  });
}
const emit = <T>(s: Socket, ev: string, arg?: unknown) =>
  new Promise<T>((r) => (arg === undefined ? s.emit(ev, r) : s.emit(ev, arg, r)));
const wait = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const answers1 = { '1.1': 'A', '1.2': 'B', '1.3': 'A', '1.4': 'B', '1.5': 'A', '1.6': 'Both' };

async function main() {
  const bad = await fetch(`${URL}/api/teacher/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: 'wrong' }) });
  check(bad.status === 401, 'wrong teacher code rejected');
  const good = await (await fetch(`${URL}/api/teacher/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: CODE }) })).json();
  check(good.ok && good.token, 'correct teacher code accepted');

  const teacher = await connect({ token: good.token });
  const student = await connect();
  const intruder = await connect({ token: 'fake' });

  await emit(teacher.s, 'teacher:reset');
  await wait();

  const denied = await emit<{ ok: boolean }>(intruder.s, 'teacher:reveal', true);
  check(!denied.ok, 'teacher action without valid token is refused');

  const incomplete = await emit<SubmitAck>(student.s, 'student:submit', { table: 1, answers: { '1.1': 'A' } });
  check(!incomplete.ok, 'incomplete submission rejected');

  const first = await emit<SubmitAck>(student.s, 'student:submit', { table: 1, groupName: 'Mallards', answers: answers1 });
  check(first.ok && first.isNew, 'first submission created');
  const id = first.ok ? first.submissionId : '';

  const dbl = await emit<SubmitAck>(student.s, 'student:submit', { table: 1, groupName: 'Mallards', answers: answers1 });
  check(dbl.ok && dbl.submissionId === id && !dbl.isNew, 'rapid duplicate (no ID) reuses the same submission');

  const upd = await emit<SubmitAck>(student.s, 'student:submit', { submissionId: id, table: 1, groupName: 'Mallards', answers: { ...answers1, '1.6': 'B' }, debatableCardId: '1.3', justification: 'Realistic?' });
  check(upd.ok && !upd.isNew && upd.submissionId === id, 'resubmission with ID updates in place');
  await wait();
  check(teacher.latest.pub?.groups[1].real === 1, 'still exactly one group for table 1');
  check(teacher.latest.pub?.counts['1.6'].B.real === 1 && teacher.latest.pub?.counts['1.6'].Both.real === 0, 'counts reflect the update');
  check(teacher.latest.teacher?.submissions[0]?.justification === 'Realistic?', 'teacher sees justification');
  check(student.latest.teacher === undefined, 'student never receives teacher state');

  const other = await connect();
  const fresh = await emit<SubmitAck>(other.s, 'student:submit', { table: 1, groupName: 'Mallards', answers: answers1 });
  check(fresh.ok && fresh.isNew && fresh.submissionId !== id, 'submission without ID from new page counts as new');

  check(student.latest.pub?.key === null, 'answer key hidden before reveal');
  await emit(teacher.s, 'teacher:lock', true);
  const locked = await emit<SubmitAck>(student.s, 'student:submit', { submissionId: id, table: 1, answers: answers1 });
  check(!locked.ok, 'submission refused while locked');

  await emit(teacher.s, 'teacher:reveal', true);
  await wait();
  check(student.latest.pub?.revealed && student.latest.pub.key?.['1.1'].preferred === 'A', 'key broadcast after reveal');

  await emit(teacher.s, 'teacher:addDemo');
  await wait();
  const demo = teacher.latest.teacher?.submissions.filter((s) => s.isDemo) ?? [];
  check(demo.length === 4 && demo.every((d) => d.groupName.startsWith('DEMO')), '4 labelled demo responses added');
  check(teacher.latest.pub?.groups[1].demo === 1 && teacher.latest.pub?.groups[1].real === 2, 'demo counted separately from real');
  await emit(teacher.s, 'teacher:clearDemo');
  await wait();
  check(teacher.latest.pub?.groups[1].demo === 0, 'demo responses cleared');

  const resetSeen = new Promise((r) => student.s.once('session:reset', r));
  await emit(teacher.s, 'teacher:reset');
  await resetSeen;
  await wait();
  check(student.latest.pub?.groups[1].real === 0 && !student.latest.pub.locked && !student.latest.pub.revealed, 'reset clears everything');

  for (const c of [teacher, student, intruder, other]) c.s.close();
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
