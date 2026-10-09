"use client";

import { useEffect, useRef } from "react";
import { seam, SEAM_MAX, SEAM_MIN } from "@/lib/seam";

// The page's only chrome. On wide screens: two fixed grounds that meet at the
// seam, a hairline down the seam, the labels for both sides, and a tick that
// travels down the line as the argument advances. On a phone: a slim balance
// bar across the top carrying the same two labels and the same value.
export function SeamChrome() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seam.start();
    const el = ref.current!;
    const tick = el.querySelector<HTMLElement>(".seam-line__tick")!;
    const onScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      tick.style.setProperty("--page", (scrollY / max).toFixed(4));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const unsub = seam.subscribe((v) => {
      el.dataset.scVerifyState = `seam ${v.toFixed(3)}`;
    });
    return () => {
      removeEventListener("scroll", onScroll);
      unsub();
    };
  }, []);

  return (
    <div ref={ref} className="seam-chrome" aria-hidden="true">
      <div className="seam-ground seam-ground--prod" />
      <div className="seam-ground seam-ground--demo" />
      <div className="seam-line">
        <span className="seam-line__label seam-line__label--demo">Demo</span>
        <span className="seam-line__label seam-line__label--prod">Production</span>
        <span className="seam-line__tick" />
      </div>
      <div className="seam-bar">
        <span>Demo</span>
        <span className="seam-bar__track">
          <span className="seam-bar__demo" />
        </span>
        <span>Production</span>
      </div>
    </div>
  );
}

// Lives inside a pinned stage. Draws the horizontal seam on a phone (the wide
// screen line is the fixed chrome above) and, in the hero, the handle that lets
// the visitor take the seam and move it themselves.
export function StageSeam({ draggable = false }: { draggable?: boolean }) {
  const handleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!draggable) return;
    seam.start();
    const handle = handleRef.current!;
    const stage = handle.closest<HTMLElement>("[data-sc-stage]")!;
    let dragging = false;

    const valueAt = (e: PointerEvent) => {
      if (!seam.narrow) return e.clientX / document.documentElement.clientWidth;
      const r = stage.getBoundingClientRect();
      return (e.clientY - r.top) / r.height;
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      handle.setPointerCapture?.(e.pointerId);
      handle.dataset.dragging = "true";
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (dragging) seam.setUser(valueAt(e));
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      handle.releasePointerCapture?.(e.pointerId);
      delete handle.dataset.dragging;
    };
    const key = (e: KeyboardEvent) => {
      const cur = seam.user ?? seam.value;
      const step = e.shiftKey ? 0.1 : 0.04;
      const map: Record<string, number> = {
        ArrowLeft: cur - step,
        ArrowUp: cur - step,
        ArrowRight: cur + step,
        ArrowDown: cur + step,
        Home: SEAM_MIN,
        End: SEAM_MAX,
      };
      if (!(e.key in map)) return;
      e.preventDefault();
      seam.setUser(map[e.key]);
    };
    const unsub = seam.subscribe((v) => {
      handle.setAttribute("aria-valuenow", String(Math.round(v * 100)));
      handle.setAttribute("aria-valuetext", `${Math.round(v * 100)}% demo, ${100 - Math.round(v * 100)}% production`);
    });

    // Move/up on the window as well as capture: a fast drag must not drop the
    // seam just because the pointer outran the handle.
    handle.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    handle.addEventListener("keydown", key);
    return () => {
      unsub();
      handle.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      handle.removeEventListener("keydown", key);
    };
  }, [draggable]);

  return (
    <div className="stage-seam">
      <span className="stage-seam__line" aria-hidden="true" />
      {draggable ? (
        <button
          ref={handleRef}
          type="button"
          className="stage-seam__handle"
          role="slider"
          aria-label="Divider between the demo and the production build. Drag or use arrow keys to move it."
          aria-valuemin={Math.round(SEAM_MIN * 100)}
          aria-valuemax={Math.round(SEAM_MAX * 100)}
          aria-valuenow={50}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6 3 12l6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
