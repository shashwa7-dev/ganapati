import type { Moment } from "@/data/story";

/** Six knots on a hand-drawn thread. */
export function TimelineThread({ moments }: { moments: Moment[] }) {
  return (
    <ol className="sk-thread" role="list">
      {moments.map((moment) => (
        <li key={moment.when} className="sk-thread-knot">
          <div className="sk-thread-when">{moment.when}</div>
          <div className="sk-thread-title sk-hand-subhead">{moment.title}</div>
          <p className="sk-thread-line sk-serif-body">{moment.line}</p>
        </li>
      ))}
    </ol>
  );
}
