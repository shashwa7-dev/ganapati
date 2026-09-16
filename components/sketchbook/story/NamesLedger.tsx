import type { Name } from "@/data/names";

/** The hundred and eight names, written down a ledger in three columns. */
export function NamesLedger({ names }: { names: Name[] }) {
  return (
    <ol className="sk-names" role="list">
      {names.map(([name, meaning], i) => (
        <li key={name} className="sk-names-row">
          <span className="sk-names-num">{String(i + 1).padStart(3, "0")}</span>
          <span className="sk-names-name sk-hand-caption" lang="sa-Latn">
            {name}
          </span>
          <span className="sk-names-meaning sk-serif-body">{meaning}</span>
        </li>
      ))}
    </ol>
  );
}
