"use client";

import { useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/sketchbook/Confetti";
import { Logo } from "@/components/sketchbook/Logo";

const MIN_MS = 2700; // the mark draws, the name and the chant fade in, then we go
const MAX_MS = 4000;
const LEAVE_MS = 600;
const CONFETTI_MS = 3400;

type Phase = "shown" | "leaving" | "confetti" | "done";

/**
 * The first thing a visitor sees on every load: the mark draws itself on
 * clay paper, the name and the chant write on, and the sheet lifts away into
 * a shower of marigolds. Leaves when the page has loaded, never before MIN_MS
 * and never after MAX_MS (both measured from navigation start); a click or
 * Escape skips it. Reduced motion: a short static card, no confetti. If the
 * script never runs, a CSS failsafe hides the sheet after six seconds.
 */
export function Splash() {
  const [phase, setPhase] = useState<Phase>("shown");
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const min = reduced ? 600 : MIN_MS;
    const capMs = reduced ? 1600 : MAX_MS;
    let loaded = document.readyState === "complete";
    let timer = 0;
    let cancelled = false;
    let left = false;
    let leaveTimer = 0;
    let confettiTimer = 0;
    let cap = 0;

    const leave = () => {
      if (cancelled || left) return;
      left = true;
      window.clearTimeout(timer);
      window.clearTimeout(cap);
      setPhase("leaving");
      leaveTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (reduced) {
          setPhase("done");
          return;
        }
        setPhase("confetti");
        confettiTimer = window.setTimeout(() => !cancelled && setPhase("done"), CONFETTI_MS);
      }, LEAVE_MS);
    };

    // Both clocks run from navigation start, so the CSS (which starts at
    // first paint) and this timer agree even when hydration lands late.
    const maybeLeave = () => {
      if (!loaded) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(leave, Math.max(0, min - performance.now()));
    };

    const onLoad = () => {
      loaded = true;
      maybeLeave();
    };
    window.addEventListener("load", onLoad);
    maybeLeave();
    cap = window.setTimeout(() => {
      loaded = true;
      leave();
    }, Math.max(0, capMs - performance.now()));
    skip.current = leave;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timer);
      window.clearTimeout(cap);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(confettiTimer);
    };
  }, []);

  if (phase === "done") return null;
  if (phase === "confetti") return <Confetti duration={CONFETTI_MS} />;

  return (
    <div className={`sk-splash room-sketch ${phase === "leaving" ? "sk-splash--leaving" : ""}`} role="status" aria-label="Loading Ganapati" onClick={() => skip.current()}>
      <div className="sk-splash-card">
        <Logo className="sk-logo sk-splash-logo" />
        <p className="sk-splash-name sk-hand-display">Ganapati</p>
        <p className="sk-splash-chant sk-hand-subhead" lang="mr-Latn">Bappa Morya</p>
      </div>
    </div>
  );
}
