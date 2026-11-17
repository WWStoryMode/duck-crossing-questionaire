import { useState } from 'react';
import type { TableId } from '../../shared/types.js';
import { Landing } from './Landing';

export function StudentApp() {
  const [joined, setJoined] = useState<{ table: TableId; groupName: string } | null>(null);
  if (!joined) return <Landing onStart={(table, groupName) => setJoined({ table, groupName })} />;
  return <main className="p-8">Table {joined.table} — activity coming in milestone 3.2</main>;
}
