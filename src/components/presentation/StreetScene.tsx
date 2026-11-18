import { DuckShape } from '../Duck';

/** Simple inline-SVG crossing seen from above: the duck family crosses a zebra crossing towards the pond. */
export function StreetScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 300" className={className} role="img" aria-labelledby="street-title">
      <title id="street-title">
        A parent duck leading six ducklings over a zebra crossing towards a pond, while a car and a cyclist approach.
      </title>
      {/* pavement (left), road (middle), grass + pond (right) */}
      <rect x="0" y="0" width="120" height="300" fill="#EFE9DC" />
      <rect x="120" y="0" width="210" height="300" fill="#3A4A63" />
      <rect x="330" y="0" width="150" height="300" fill="#DCE8DA" />
      <rect x="116" y="0" width="5" height="300" fill="#1B2A41" opacity="0.3" />
      <rect x="329" y="0" width="5" height="300" fill="#1B2A41" opacity="0.3" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x="223" y={i * 46 - 10} width="4" height="24" fill="#FBF8F1" opacity="0.7" />
      ))}
      {/* zebra crossing */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={128 + i * 29} y="112" width="17" height="86" fill="#FBF8F1" />
      ))}
      {/* pond */}
      <ellipse cx="420" cy="150" rx="52" ry="70" fill="#BFD8DC" stroke="#1B2A41" strokeWidth="2" />
      <path d="M404 128 q8 -6 16 0 M414 168 q8 -6 16 0" stroke="#1B2A41" strokeWidth="1.5" fill="none" opacity="0.5" />
      <text x="420" y="246" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1B2A41">Pond</text>
      {/* pedestrian signal */}
      <rect x="86" y="70" width="26" height="40" rx="4" fill="#1B2A41" />
      <circle cx="99" cy="81" r="6" fill="#5b6576" />
      <circle cx="99" cy="99" r="6" fill="#7BC47F" />
      <rect x="96" y="110" width="5" height="18" fill="#1B2A41" />
      {/* car coming down (top-down view) */}
      <g transform="translate(150 6)">
        <rect x="0" y="0" width="54" height="86" rx="12" fill="#E9C46A" stroke="#1B2A41" strokeWidth="2.5" />
        <rect x="8" y="54" width="38" height="18" rx="4" fill="#FBEFCB" stroke="#1B2A41" strokeWidth="2" />
        <rect x="8" y="14" width="38" height="12" rx="3" fill="#FBEFCB" stroke="#1B2A41" strokeWidth="2" />
      </g>
      {/* cyclist coming up (top-down view) */}
      <g transform="translate(272 222)">
        <rect x="-3" y="0" width="6" height="64" rx="3" fill="#1B2A41" />
        <rect x="-16" y="10" width="32" height="5" rx="2.5" fill="#1B2A41" />
        <circle cx="0" cy="30" r="12" fill="#DCE8DA" stroke="#1B2A41" strokeWidth="2.5" />
      </g>
      {/* duck family: six ducklings following the parent across */}
      <g transform="translate(18 136)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <DuckShape key={i} x={i * 30} scale={0.45} />
        ))}
        <DuckShape x={188} scale={0.9} />
      </g>
    </svg>
  );
}
