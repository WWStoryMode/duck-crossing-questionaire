import { StudentApp } from './pages/StudentApp';
import { Teacher } from './pages/Teacher';
import { Results } from './pages/Results';

const TITLES: Record<string, string> = {
  '/teacher': 'Teacher — Duck Crossing',
  '/results': 'Live results — Duck Crossing',
};

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.title = TITLES[path] ?? 'Duck Crossing';
  if (path === '/teacher') return <Teacher />;
  if (path === '/results') return <Results />;
  return <StudentApp />;
}

