import { StudentApp } from './pages/StudentApp';
import { Teacher } from './pages/Teacher';
import { Results } from './pages/Results';
import { Presentation } from './pages/Presentation';

const TITLES: Record<string, string> = {
  '/teacher': 'Teacher — Duck Crossing',
  '/results': 'Live results — Duck Crossing',
  '/present': 'Presentation — Duck Crossing',
};

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.title = TITLES[path] ?? 'Duck Crossing';
  if (path === '/teacher') return <Teacher />;
  if (path === '/results') return <Results />;
  if (path === '/present') return <Presentation />;
  return <StudentApp />;
}

