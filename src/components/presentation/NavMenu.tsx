import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '/present', label: 'Presentation', current: true },
  { href: '/teacher', label: 'Teacher Dashboard' },
  { href: '/', label: 'Student Questionnaire' },
  { href: '/results', label: 'Results' },
];

/** Small menu of app pages. Other pages open in a new tab so this tab keeps its timers and connection. */
export function NavMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={wrap} className="relative" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <button type="button" className="ctl-btn" aria-expanded={open} aria-controls="present-nav" onClick={() => setOpen((o) => !o)}>
        ☰ Menu
      </button>
      {open && (
        <ul id="present-nav" className="absolute bottom-full right-0 mb-2 w-60 rounded-xl border border-navy/15 bg-white p-2 shadow-lg">
          {LINKS.map((l) => (
            <li key={l.href}>
              {l.current ? (
                <span aria-current="page" className="block rounded-lg bg-sun-light px-3 py-2 font-bold">
                  {l.label} (this tab)
                </span>
              ) : (
                <a href={l.href} target="_blank" rel="noopener" className="block rounded-lg px-3 py-2 font-semibold hover:bg-paper">
                  {l.label} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
