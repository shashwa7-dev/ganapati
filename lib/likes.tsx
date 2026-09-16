"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ganapati:liked";

type Counts = Record<number, number>;

type LikesContextValue = {
  counts: Counts;
  liked: Set<number>;
  toggle: (id: number) => void;
  /** False until the first fetch has settled, so counts can be hidden briefly. */
  ready: boolean;
};

const LikesContext = createContext<LikesContextValue | null>(null);

function readLiked(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : []);
  } catch {
    return new Set();
  }
}

function writeLiked(liked: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...liked]));
  } catch {
    /* private mode or full storage: the like still counts, it just won't be remembered */
  }
}

/** One fetch of the counts for the whole page; every heart reads from here. */
export function LikesProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>({});
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [ready, setReady] = useState(false);

  // Mirror of `liked` that updates synchronously, so two quick clicks never read stale state.
  const likedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const stored = readLiked();
    likedRef.current = stored;
    setLiked(stored);
    let cancelled = false;
    fetch("/api/likes", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { counts: {} }))
      .then((data: { counts?: Counts }) => {
        if (cancelled) return;
        setCounts(data.counts ?? {});
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback((id: number) => {
    const wasLiked = likedRef.current.has(id);
    const delta: 1 | -1 = wasLiked ? -1 : 1;
    const next = new Set(likedRef.current);
    if (wasLiked) next.delete(id);
    else next.add(id);
    likedRef.current = next;
    writeLiked(next);
    setLiked(next);
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));

    fetch("/api/likes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, delta }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ id: number; count: number }>;
      })
      .then((data) => setCounts((prev) => ({ ...prev, [id]: data.count })))
      .catch(() => {
        // Revert the optimistic change.
        const reverted = new Set(likedRef.current);
        if (delta === 1) reverted.delete(id);
        else reverted.add(id);
        likedRef.current = reverted;
        writeLiked(reverted);
        setLiked(reverted);
        setCounts((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - delta) }));
      });
  }, []);

  const value = useMemo(() => ({ counts, liked, toggle, ready }), [counts, liked, toggle, ready]);
  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export function useLikes(): LikesContextValue {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used inside <LikesProvider>");
  return ctx;
}
