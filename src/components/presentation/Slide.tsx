import type { ReactNode } from 'react';

/** The 16:9 stage. Everything inside scales with the stage width (cqw units). */
export function Stage({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className="stage text-navy shadow-xl" aria-roledescription="slide" aria-label={label}>
      {children}
    </section>
  );
}

/** Standard slide layout: optional kicker, title, then content. */
export function SlideLayout({ kicker, title, children, className = '' }: { kicker?: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`s-pad flex h-full flex-col ${className}`}>
      {kicker && <p className="s-kicker text-moss">{kicker}</p>}
      <h2 className="s-title mt-[0.6cqw]">{title}</h2>
      <div className="mt-[2.5cqw] flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
