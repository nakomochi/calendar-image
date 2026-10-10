import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY_PREFIX = 'calimg:v1:';

export interface PersistOptions<T> {
  // Validates/merges the parsed saved value. Return null to discard it and use `initial`.
  merge?: (initial: T, saved: unknown) => T | null;
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Shallow merge so fields added in later versions fall back to their defaults.
function defaultMerge<T>(initial: T, saved: unknown): T | null {
  if (!isPlainObject(initial) || !isPlainObject(saved)) return null;
  return { ...initial, ...saved } as T;
}

function load<T>(storageKey: string, initial: T, merge: NonNullable<PersistOptions<T>['merge']>): T {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return initial;
    return merge(initial, JSON.parse(raw)) ?? initial;
  } catch {
    return initial;
  }
}

// A writable store mirrored to localStorage. On the server it is a plain writable.
export function persisted<T>(key: string, initial: T, opts: PersistOptions<T> = {}): Writable<T> {
  if (!browser) return writable(initial);

  const storageKey = KEY_PREFIX + key;
  const store = writable(load(storageKey, initial, opts.merge ?? defaultMerge));

  store.subscribe((value) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Quota exceeded or storage disabled (private mode): keep working in memory.
    }
  });

  return store;
}
