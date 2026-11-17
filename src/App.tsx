import { StudentApp } from './pages/StudentApp';
import { Teacher } from './pages/Teacher';
import { Results } from './pages/Results';

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/teacher') return <Teacher />;
  if (path === '/results') return <Results />;
  return <StudentApp />;
}

