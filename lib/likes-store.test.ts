import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryStore, UpstashStore, getStore } from "./likes-store.ts";

test("MemoryStore starts empty and counts up and down", async () => {
  const store = new MemoryStore();
  assert.deepEqual(await store.all(), {});
  assert.equal(await store.bump(61, 1), 1);
  assert.equal(await store.bump(61, 1), 2);
  assert.equal(await store.bump(61, -1), 1);
  assert.deepEqual(await store.all(), { 61: 1 });
});

test("MemoryStore never goes below zero", async () => {
  const store = new MemoryStore();
  assert.equal(await store.bump(3, -1), 0);
  assert.equal(await store.bump(3, -1), 0);
  assert.deepEqual(await store.all(), { 3: 0 });
});

function fakeFetch(results: unknown[]) {
  const calls: { url: string; body: unknown; auth: string | undefined }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string>;
    calls.push({ url: String(url), body: JSON.parse(String(init?.body)), auth: headers?.Authorization });
    const result = results.shift();
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as typeof fetch;
  return { impl, calls };
}

test("UpstashStore.all sends HGETALL and parses the flat reply", async () => {
  const { impl, calls } = fakeFetch([["61", "5", "3", "12", "9", "-2"]]);
  const store = new UpstashStore("https://example.upstash.io/", "tok", impl);
  const counts = await store.all();
  assert.deepEqual(counts, { 61: 5, 3: 12, 9: 0 });
  assert.equal(calls[0].url, "https://example.upstash.io");
  assert.deepEqual(calls[0].body, ["HGETALL", "likes"]);
  assert.equal(calls[0].auth, "Bearer tok");
});

test("UpstashStore.bump sends HINCRBY and returns the new count", async () => {
  const { impl, calls } = fakeFetch([7]);
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  assert.equal(await store.bump(61, 1), 7);
  assert.deepEqual(calls[0].body, ["HINCRBY", "likes", "61", "1"]);
});

test("UpstashStore.bump clamps a negative result back to zero", async () => {
  const { impl, calls } = fakeFetch([-1, 0]);
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  assert.equal(await store.bump(61, -1), 0);
  assert.deepEqual(calls[1].body, ["HSET", "likes", "61", "0"]);
});

test("UpstashStore throws on a non-2xx reply", async () => {
  const impl = (async () => new Response("nope", { status: 500 })) as typeof fetch;
  const store = new UpstashStore("https://example.upstash.io", "tok", impl);
  await assert.rejects(() => store.all(), /Upstash 500/);
});

test("getStore picks Upstash only when both variables are set", () => {
  assert.ok(getStore({}) instanceof MemoryStore);
  assert.ok(getStore({ UPSTASH_REDIS_REST_URL: "https://x" }) instanceof MemoryStore);
  assert.ok(
    getStore({ UPSTASH_REDIS_REST_URL: "https://x", UPSTASH_REDIS_REST_TOKEN: "t" }) instanceof UpstashStore,
  );
});
