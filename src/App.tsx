import { StudentApp } from './pages/StudentApp';
import { Teacher } from './pages/Teacher';

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/teacher') return <Teacher />;
  if (path === '/results') return <Placeholder name="Live results" />;
  return <StudentApp />;
}

function Placeholder({ name }: { name: string }) {
  return <main className="p-8 text-xl">{name} — coming in a later step.</main>;
}
