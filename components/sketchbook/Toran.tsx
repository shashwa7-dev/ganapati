/**
 * A string of marigold swags with mango leaves, hung along the top of the
 * page like a toran over a doorway. One repeating swag, 200 units wide; the
 * SVG is scaled by height and sliced on the right, so the swags keep their
 * shape at any width.
 */
export function Toran() {
  return (
    <div className="sk-toran" aria-hidden="true">
      <svg viewBox="0 0 8000 74" preserveAspectRatio="xMinYMin slice" focusable="false">
        <defs>
          <pattern id="sk-toran-swag" x="0" y="0" width="200" height="74" patternUnits="userSpaceOnUse">
            <path className="sk-toran-string" d="M0 6 Q100 62 200 6" />
            <path className="sk-toran-string" d="M0 10 Q100 66 200 10" />
            <circle className="sk-toran-flower" cx="24" cy="15" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="52" cy="26" r="6.5" />
            <circle className="sk-toran-flower" cx="80" cy="35" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="100" cy="38" r="7" />
            <circle className="sk-toran-flower" cx="120" cy="35" r="6.5" />
            <circle className="sk-toran-flower sk-toran-flower--s" cx="148" cy="26" r="6.5" />
            <circle className="sk-toran-flower" cx="176" cy="15" r="6.5" />
            <path className="sk-toran-leaf" d="M92 44 c-5 9 5 12 0 24 c-6 -10 -2 -16 0 -24z" />
            <path className="sk-toran-leaf" d="M100 46 c-5 9 5 13 0 26 c-6 -11 -2 -17 0 -26z" />
            <path className="sk-toran-leaf" d="M108 44 c-5 9 5 12 0 24 c-6 -10 -2 -16 0 -24z" />
            <path className="sk-toran-leaf" d="M52 33 c-4 7 4 9 0 18 c-5 -8 -2 -12 0 -18z" />
            <path className="sk-toran-leaf" d="M148 33 c-4 7 4 9 0 18 c-5 -8 -2 -12 0 -18z" />
            <path className="sk-toran-string" d="M196 2 c 3 4, 5 4, 8 0 M198 6 l 0 5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="8000" height="74" fill="url(#sk-toran-swag)" />
      </svg>
    </div>
  );
}
