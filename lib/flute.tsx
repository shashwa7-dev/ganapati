"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const MUTED_KEY = "flute:muted";

type FluteContextValue = { playing: boolean; toggle: () => void };

const FluteContext = createContext<FluteContextValue | null>(null);

/**
 * Owns the one <audio> for the whole site. Mounted in the root layout, which
 * Next keeps alive across client navigations, so the track carries on from
 * the drawings to the story and back. Nothing plays until the visitor asks.
 */
export function FluteProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  // the visitor's explicit choice: once they mute, we never force it back on
  const mutedRef = useRef(false);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      mutedRef.current = true;
      try { localStorage.setItem(MUTED_KEY, "1"); } catch {}
      audio.pause();
      return;
    }
    mutedRef.current = false;
    try { localStorage.removeItem(MUTED_KEY); } catch {}
    try {
      await audio.play();
    } catch {
      // Blocked or unsupported: the button simply stays in its "play" state.
    }
  }, []);

  // On the visitor's very first interaction anywhere, start the flute once —
  // that gesture is also what unlocks audio in the browser. Skipped if they
  // muted it (now or on a past visit), or if the gesture is the flute button
  // itself (its own handler takes over, so we don't fight it).
  useEffect(() => {
    try { if (localStorage.getItem(MUTED_KEY)) mutedRef.current = true; } catch {}

    const onFirst = (event: Event) => {
      const target = event.target;
      const onFluteButton = target instanceof Element && target.closest(".sk-flute");
      const audio = audioRef.current;
      if (!mutedRef.current && !onFluteButton && audio && audio.paused) {
        audio.play().catch(() => {});
      }
      done();
    };
    const events = ["pointerdown", "click", "keydown"] as const;
    const done = () => events.forEach((e) => window.removeEventListener(e, onFirst));

    events.forEach((e) => window.addEventListener(e, onFirst));
    return done;
  }, []);

  const value = useMemo(() => ({ playing, toggle }), [playing, toggle]);

  return (
    <FluteContext.Provider value={value}>
      <audio
        ref={audioRef}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/audio/meditative-flute.webm" type='audio/webm; codecs="opus"' />
        <source src="/audio/meditative-flute.m4a" type="audio/mp4" />
      </audio>
      {children}
    </FluteContext.Provider>
  );
}

export function useFlute(): FluteContextValue {
  const ctx = useContext(FluteContext);
  if (!ctx) throw new Error("useFlute must be used inside <FluteProvider>");
  return ctx;
}
