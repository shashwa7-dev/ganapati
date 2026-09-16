"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

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

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      // Blocked or unsupported: the button simply stays in its "play" state.
    }
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
