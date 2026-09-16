/** Validates a like toggle. Only erasable TypeScript: loaded by node --test. */
export function parseToggle(
  body: unknown,
  known: (id: number) => boolean,
): { id: number; delta: 1 | -1 } | null {
  if (!body || typeof body !== "object") return null;
  const { id, delta } = body as Record<string, unknown>;
  if (typeof id !== "number" || !Number.isInteger(id) || !known(id)) return null;
  if (delta !== 1 && delta !== -1) return null;
  return { id, delta };
}
