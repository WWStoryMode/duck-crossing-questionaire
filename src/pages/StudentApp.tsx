import { useState } from 'react';
import type { TableId } from '../../shared/types.js';
import { Landing } from './Landing';
import { Activity } from './Activity';

export function StudentApp() {
  const [joined, setJoined] = useState<{ table: TableId; groupName: string } | null>(null);
  if (!joined) return <Landing onStart={(table, groupName) => setJoined({ table, groupName })} />;
  return <Activity table={joined.table} groupName={joined.groupName} onBack={() => setJoined(null)} />;
}
