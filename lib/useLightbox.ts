"use client";

import { useCallback, useEffect, useRef, type TouchEvent } from "react";

/**
 * What every full-screen viewer needs and none should re-implement:
 * Escape closes, arrow keys move, focus enters the dialog and returns on
 * close, page scroll is locked, and a horizontal swipe moves.
 */
export function useLightbox({
  onClose,
  onMove,
}: {
  onClose: () => void;
  onMove: (delta: 1 | -1) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const restoreTo = useRef<Element | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement;
    dialogRef.current?.focus({ preventScroll: true });
    document.documentElement.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      (restoreTo.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onMove(1);
      if (event.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  const onTouchStart = useCallback((event: TouchEvent) => {
    touchX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent) => {
      const start = touchX.current;
      touchX.current = null;
      const end = event.changedTouches[0]?.clientX;
      if (start === null || end === undefined) return;
      const dx = end - start;
      if (Math.abs(dx) > 48) onMove(dx < 0 ? 1 : -1);
    },
    [onMove],
  );

  return { dialogRef, onTouchStart, onTouchEnd };
}
