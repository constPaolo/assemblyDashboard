import { useSyncExternalStore } from 'react';

/** A value kept in localStorage that components can subscribe to. */
export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

export function persistent<T>(key: string, initial: T): Store<T> {
  const listeners = new Set<() => void>();
  let value: T = read() ?? initial;

  function read(): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  function emit() {
    listeners.forEach(l => l());
  }

  return {
    get: () => value,
    set(next) {
      value = typeof next === 'function' ? (next as (prev: T) => T)(value) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage full or blocked: keep the in-memory value.
      }
      emit();
    },
    reset() {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore.
      }
      value = initial;
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}
