"use client";

import { useSyncExternalStore } from "react";

// The capabilities a visitor adds while reading "What we build". The choice
// travels down the page into the closing form and into their email, instead
// of resetting at the call to action.

let picks: string[] = [];
const listeners = new Set<() => void>();

export function togglePick(name: string) {
  picks = picks.includes(name) ? picks.filter((p) => p !== name) : [...picks, name];
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const EMPTY: string[] = [];

export function usePicks() {
  return useSyncExternalStore(
    subscribe,
    () => picks,
    () => EMPTY,
  );
}
