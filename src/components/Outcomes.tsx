import type { TableContent } from '../../shared/types.js';

export function Outcomes({ table, large }: { table: TableContent; large?: boolean }) {
  const text = large ? 'text-xl lg:text-2xl' : 'text-base';
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border-l-8 border-moss bg-moss-light p-4">
        <p className="text-sm font-extrabold uppercase tracking-wide">Learning Outcome A</p>
        <p className={`mt-1 font-medium ${text}`}>{table.outcomeA}</p>
      </div>
      <div className="rounded-xl border-l-8 border-sun bg-sun-light p-4">
        <p className="text-sm font-extrabold uppercase tracking-wide">Learning Outcome B</p>
        <p className={`mt-1 font-medium ${text}`}>{table.outcomeB}</p>
      </div>
    </div>
  );
}
