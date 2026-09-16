/**
 * The mark: a hand-drawn Ganesha face, the same drawing as the favicon,
 * coloured by the tokens so it sits on any sketchbook surface.
 */
export function Logo({ className = "sk-logo" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <g className="sk-logo-ink">
        <path pathLength={1} d="M22 21 Q32 17 42 21" />
        <path pathLength={1} d="M22 21 L25 11 L29 17 L32 5 L35 17 L39 11 L42 21" />
        <path pathLength={1} d="M22 24 C 22 16, 42 16, 42 24 C 43 34, 39 40, 32 42 C 25 40, 21 34, 22 24 Z" />
        <path pathLength={1} d="M22 27 C 12 23, 8 33, 14 41 C 17 44, 21 42, 22 38" />
        <path pathLength={1} d="M42 27 C 52 23, 56 33, 50 41 C 47 44, 43 42, 42 38" />
        <path pathLength={1} d="M32 42 C 33 48, 31 55, 25 56 C 20 56, 19 50, 24 49" />
      </g>
      <circle className="sk-logo-jewel" cx="32" cy="5" r="2.2" />
      <circle className="sk-logo-eye" cx="28" cy="30" r="1.9" />
      <circle className="sk-logo-eye" cx="36" cy="30" r="1.9" />
      <path className="sk-logo-tilak" d="M32 23 l 0 5" />
    </svg>
  );
}
