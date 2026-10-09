"use client";

import { togglePick, usePicks } from "@/lib/picks";

export default function PickButton({ name }: { name: string }) {
  const on = usePicks().includes(name);
  return (
    <button type="button" className="pick" aria-pressed={on} onClick={() => togglePick(name)}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {on ? (
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
      {on ? "In your platform" : "Add to my platform"}
    </button>
  );
}
