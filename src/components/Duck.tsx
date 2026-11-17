type Props = { className?: string; title?: string };

function DuckShape({ x = 0, scale = 1 }: { x?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${60 - 60 * scale}) scale(${scale})`}>
      <ellipse cx="30" cy="44" rx="24" ry="14" fill="#E9C46A" stroke="#1B2A41" strokeWidth="2" />
      <path d="M10 40 q-6 -6 -2 -12 q6 6 10 8z" fill="#E9C46A" stroke="#1B2A41" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="46" cy="24" r="12" fill="#E9C46A" stroke="#1B2A41" strokeWidth="2" />
      <path d="M56 24 l10 3 -10 4z" fill="#E07A2F" stroke="#1B2A41" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="49" cy="21" r="2" fill="#1B2A41" />
      <path d="M22 44 q10 6 18 -2" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

/** Parent duck leading six ducklings. Decorative unless a title is given. */
export function DuckFamily({ className, title }: Props) {
  return (
    <svg viewBox="0 0 330 64" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <line x1="0" y1="62" x2="330" y2="62" stroke="#1B2A41" strokeWidth="2" strokeDasharray="10 8" opacity="0.35" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <DuckShape key={i} x={i * 36} scale={0.5} />
      ))}
      <DuckShape x={240} scale={1} />
    </svg>
  );
}

export function Duck({ className, title }: Props) {
  return (
    <svg viewBox="0 0 70 62" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <DuckShape />
    </svg>
  );
}
