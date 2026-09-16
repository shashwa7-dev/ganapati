"use client";

import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { HeartDoodle } from "@/components/sketchbook/doodles";
import { useLikes } from "@/lib/likes";

/** A hand-drawn heart and its count. Its own button, never inside the work's. */
export function LikeButton({ id, className = "" }: { id: number; className?: string }) {
  const { counts, liked, toggle, ready } = useLikes();
  const on = liked.has(id);
  const count = counts[id] ?? 0;
  const [thump, setThump] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? "Unlike" : "Like"} No. ${formatNumber(id)}`}
      className={`sk-heart ${on ? "is-on" : ""} ${thump ? "is-thump" : ""} ${className}`}
      onClick={(event) => {
        event.stopPropagation();
        if (!on) setThump(true);
        toggle(id);
      }}
      onAnimationEnd={() => setThump(false)}
    >
      <HeartDoodle />
      <span aria-live="polite" style={{ minWidth: "1.2em" }}>
        {ready || count > 0 ? count : ""}
      </span>
    </button>
  );
}
