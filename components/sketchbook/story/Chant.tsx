/** The farewell, written large, with its meaning underneath. */
export function Chant({ lines, gloss }: { lines: [string, string]; gloss: string }) {
  return (
    <div className="sk-chant">
      <p className="sk-chant-lines sk-hand-heading" lang="mr-Latn">
        {lines[0]}
        <br />
        {lines[1]}
      </p>
      <p className="sk-chant-gloss sk-hand-note">{gloss}</p>
    </div>
  );
}
