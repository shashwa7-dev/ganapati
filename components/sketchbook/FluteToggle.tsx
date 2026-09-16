"use client";

import { FluteDoodle } from "@/components/sketchbook/doodles";
import { useFlute } from "@/lib/flute";

/** The header's play/pause button. The waveform is always there; it only moves while the track does. */
export function FluteToggle() {
  const { playing, toggle } = useFlute();

  return (
    <div className="sk-flute" data-playing={playing ? "" : undefined}>
      <button
        type="button"
        className="sk-flute-play"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Pause the flute" : "Play the flute"}
      >
        <FluteDoodle />
        <span>{playing ? "pause the flute" : "play the flute"}</span>
        <span className="sk-flute-waves" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
    </div>
  );
}
