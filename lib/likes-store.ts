/**
 * Where like counts live. One interface, two homes: a Map for local
 * development and tests, Upstash Redis (over its REST API, no SDK) in
 * production. Only erasable TypeScript here: this file is loaded by
 * `node --test` without a compile step.
 */

export interface LikesStore {
  all(): Promise<Record<number, number>>;
  bump(id: number, delta: 1 | -1): Promise<number>;
}

export class MemoryStore implements LikesStore {
  counts: Map<number, number> = new Map();

  async all(): Promise<Record<number, number>> {
    return Object.fromEntries(this.counts);
  }

  async bump(id: number, delta: 1 | -1): Promise<number> {
    const next = Math.max(0, (this.counts.get(id) ?? 0) + delta);
    this.counts.set(id, next);
    return next;
  }
}

const HASH = "likes";

export class UpstashStore implements LikesStore {
  url: string;
  token: string;
  fetchImpl: typeof fetch;

  constructor(url: string, token: string, fetchImpl: typeof fetch = fetch) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  /** One Redis command as Upstash's REST API expects it: a JSON array. */
  async command<T>(...parts: (string | number)[]): Promise<T> {
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(parts.map(String)),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}`);
    const data = (await res.json()) as { result?: T; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result as T;
  }

  async all(): Promise<Record<number, number>> {
    const flat = await this.command<string[]>("HGETALL", HASH);
    const counts: Record<number, number> = {};
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const id = Number(flat[i]);
      const n = Number(flat[i + 1]);
      if (Number.isInteger(id) && Number.isFinite(n)) counts[id] = Math.max(0, n);
    }
    return counts;
  }

  async bump(id: number, delta: 1 | -1): Promise<number> {
    const next = await this.command<number>("HINCRBY", HASH, id, delta);
    if (next < 0) {
      await this.command("HSET", HASH, id, 0);
      return 0;
    }
    return next;
  }
}

let store: LikesStore | null = null;

/** The store for this process, chosen once from the environment. */
export function getStore(
  env: Record<string, string | undefined> = process.env,
): LikesStore {
  if (env !== process.env) return make(env);
  if (!store) store = make(env);
  return store;
}

function make(env: Record<string, string | undefined>): LikesStore {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new UpstashStore(url, token) : new MemoryStore();
}
