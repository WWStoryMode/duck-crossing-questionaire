import { StudentApp } from './pages/StudentApp';

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/teacher') return <Placeholder name="Teacher dashboard" />;
  if (path === '/results') return <Placeholder name="Live results" />;
  return <StudentApp />;
}

function Placeholder({ name }: { name: string }) {
  return <main className="p-8 text-xl">{name} — coming in a later step.</main>;
}
