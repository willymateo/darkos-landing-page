// The seam: the one line that splits the page into DEMO and PRODUCTION.
//
// Its value is the demo share of the frame, 0..1. On wide screens that is an x
// position across the viewport; below 860px the split turns horizontal and the
// value is a y position inside the hero and closing stages.
//
// Every section that takes part carries data-seam="0.5". A pinned section can
// also carry data-seam-sweep="from to start end": the seam travels from `from`
// to `to` while the act's progress runs from `start` to `end`. The hero carries
// data-seam-hero, which lets the visitor's drag override its value.
//
// One rAF loop reads the sections, blends between neighbours as a boundary
// crosses the middle of the viewport, and publishes:
//   --seam     the value, on <html>
//   --seam-x   the value in px across the layout viewport (wide screens)
//   --sweep    0..1 on each sweep section, for its own CSS
// and notifies subscribers (the WebGL scenes) so they redraw with it.

type Listener = (value: number) => void;

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const smooth = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};

export const SEAM_MIN = 0.18;
export const SEAM_MAX = 0.82;

class Seam {
  value = 0.5;
  user: number | null = null;
  listeners = new Set<Listener>();
  private raf = 0;
  private started = false;
  private reduce = false;
  private narrowMQ: MediaQueryList | null = null;
  private last = -1;

  get narrow() {
    return this.narrowMQ?.matches ?? false;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.value);
    return () => {
      this.listeners.delete(fn);
    };
  }

  setUser(v: number | null) {
    this.user = v === null ? null : clamp(v, SEAM_MIN, SEAM_MAX);
    this.kick();
  }

  start() {
    if (this.started || typeof window === "undefined") return;
    this.started = true;
    this.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.narrowMQ = matchMedia("(max-width: 860px)");
    const kick = () => this.kick();
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    this.narrowMQ.addEventListener("change", kick);
    this.kick();
  }

  kick() {
    if (!this.raf) this.raf = requestAnimationFrame(this.tick);
  }

  private target(): number {
    const vh = innerHeight;
    const mid = vh * 0.5;
    const sections = [...document.querySelectorAll<HTMLElement>("[data-seam]")];
    if (!sections.length) return 0.5;

    const valueOf = (el: HTMLElement) => {
      const base = parseFloat(el.dataset.seam || "0.5");
      if (el.hasAttribute("data-seam-hero") && this.user !== null) return this.user;
      const sweep = el.dataset.seamSweep;
      if (!sweep) return base;
      const [from, to, a, b] = sweep.split(/\s+/).map(parseFloat);
      const r = el.getBoundingClientRect();
      const travel = Math.max(r.height - vh, 1);
      const p = clamp(-r.top / travel, 0, 1);
      let t = smooth((p - a) / (b - a));
      // Reduced motion: no travelling line. The state changes in one step and
      // the closing layers crossfade on opacity instead.
      if (this.reduce) t = p >= (a + b) / 2 ? 1 : 0;
      el.style.setProperty("--sweep", t.toFixed(4));
      el.toggleAttribute("data-swept", t >= 0.999);
      return from + (to - from) * t;
    };

    let i = 0;
    for (let k = 0; k < sections.length; k++) {
      if (sections[k].getBoundingClientRect().top <= mid) i = k;
    }
    const cur = valueOf(sections[i]);
    const next = sections[i + 1];
    if (!next) return cur;
    // Blend while the next section's top travels from 75% to 25% of the
    // viewport, so the line tips across a boundary instead of jumping.
    const top = next.getBoundingClientRect().top;
    const t = smooth((vh * 0.75 - top) / (vh * 0.5));
    if (t <= 0) return cur;
    return cur + (valueOf(next) - cur) * t;
  }

  private tick = () => {
    this.raf = 0;
    const goal = this.target();
    const rate = this.reduce ? 1 : 0.22;
    const v = this.value + (goal - this.value) * rate;
    this.value = Math.abs(goal - v) < 0.0004 ? goal : v;

    if (this.value !== this.last) {
      this.last = this.value;
      const root = document.documentElement;
      root.style.setProperty("--seam", this.value.toFixed(4));
      root.style.setProperty("--seam-x", `${(this.value * root.clientWidth).toFixed(1)}px`);
      this.listeners.forEach((fn) => fn(this.value));
    }
    if (this.value !== goal) this.kick();
  };
}

export const seam = new Seam();
