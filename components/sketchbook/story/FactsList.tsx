import type { Fact } from "@/data/story";

/** A dashed, ruled list in the hand, the way facts get jotted in a margin. */
export function FactsList({ facts }: { facts: Fact[] }) {
  return (
    <dl className="sk-facts">
      {facts.map(([key, value]) => (
        <div key={key} className="sk-facts-row">
          <dt className="sk-facts-key">{key}</dt>
          <dd className="sk-facts-value sk-hand-caption">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
