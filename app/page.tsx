import type { CSSProperties } from "react";
import Composer from "@/components/Composer";
import { BUILD } from "@/lib/capabilities";
import PickButton from "@/components/PickButton";
import { Mark, Wordmark } from "@/components/Mark";
import ScrollCraftMount from "@/components/ScrollCraftMount";
import { SeamChrome, StageSeam } from "@/components/SeamChrome";
import SeamScene from "@/components/SeamScene";
import Trace from "@/components/Trace";
import { SITE } from "@/lib/site";

// Split stage. The page is two columns held in tension the whole way down,
// DEMO on the left and PRODUCTION on the right, with the seam as the only
// chrome. Every section declares where its seam sits (data-seam); the close
// sweeps it to the edge and the production side takes the frame.

const s = (v: number) => ({ "--s": v }) as CSSProperties;

const PHASES: { name: string; bring: string; deliver: string }[] = [
  {
    name: "Frame",
    bring: "The problem, and the number it should move.",
    deliver: "A scoped use case, success criteria agreed before any code, and an honest go or no-go.",
  },
  {
    name: "Prove",
    bring: "Real examples from your business, including the messy ones.",
    deliver: "An evaluation suite first, then a working slice measured against it.",
  },
  {
    name: "Build",
    bring: "Access to the systems the agents need to touch.",
    deliver: "Agents, tools, retrieval and guardrails on your infrastructure, versioned like any other software.",
  },
  {
    name: "Run",
    bring: "The team who will own it.",
    deliver: "Monitoring, cost controls and a proper handover, so it keeps working after we leave.",
  },
];

export default function Home() {
  return (
    <>
      <SeamChrome />
      <div className="sc-grain" aria-hidden="true" />

      <main>
        {/* 1 · CURIOSITY: the split, live, and a handle to take it */}
        <section className="hero" data-sc-act="pin" data-sc-span="1.7" data-seam="0.5" data-seam-hero="">
          <div data-sc-stage className="hero__stage">
            <SeamScene mode="hero" className="hero__scene" />
            <Wordmark className="hero__wordmark" />
            <h1 className="hero__title">
              <span className="hero__line hero__line--demo" data-sc-cue="0 0.8 0">
                Too much of your business still runs by hand.
              </span>{" "}
              <span className="hero__line hero__line--prod" data-sc-cue="0 0.8 0">
                We build agentic platforms.
              </span>
            </h1>
            <StageSeam draggable />
            <div className="hero__foot" data-sc-cue="0 0.74 0">
              <p>{SITE.tagline}</p>
              <a className="cta" href="#bring">
                {SITE.cta}
              </a>
            </div>
          </div>
        </section>

        {/* 2 · RECOGNITION: what we build, each capability against the problem it solves */}
        <section id="build" className="build" data-seam="0.36" style={s(0.36)} aria-labelledby="build-title">
          <div className="split build__head" data-sc-act="flow">
            <h2 id="build-title" className="split-heading">
              <span className="split__demo split-heading__demo" data-sc-cue="0.1 1 0.22 0" data-sc-kinetic="lines">
                What slows your business down.
              </span>{" "}
              <span className="split__prod split-heading__prod" data-sc-cue="0.16 1 0.22 0" data-sc-kinetic="lines">
                What we build.
              </span>
            </h2>
          </div>
          <ul className="build__rows">
            {BUILD.map((b) => (
              <li key={b.name} className="split build__row" data-sc-act="flow">
                <p className="split__demo build__problem" data-sc-reveal="left" data-sc-reveal-at="0.03 0.17">
                  {b.problem}
                </p>
                <div className="split__prod build__prod" data-sc-reveal="right" data-sc-reveal-at="0.06 0.2">
                  <h3 className="build__name">{b.name}</h3>
                  <div className="build__body">
                    <p className="build__desc">{b.desc}</p>
                    <PickButton name={b.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 · CLARITY: one request, both systems, stepped by scroll */}
        <section className="trace-act" data-sc-act="pin" data-sc-span="2.8" data-seam="0.5" style={s(0.5)}>
          <div data-sc-stage className="trace-act__stage">
            <Trace />
          </div>
        </section>

        {/* 4 · CONFIDENCE: the engagement, as a calm two-sided ledger */}
        <section className="method" data-seam="0.48" style={s(0.48)} aria-labelledby="method-title">
          <div className="split method__head" data-sc-in>
            <div className="split__demo">
              <h2 id="method-title" className="method__title">
                How an engagement runs
              </h2>
              <p className="method__side">What you bring</p>
            </div>
            <div className="split__prod">
              <p className="method__side method__side--prod">What we deliver</p>
            </div>
          </div>
          <ol className="method__rows" data-sc-in data-sc-stagger="70">
            {PHASES.map((ph) => (
              <li key={ph.name} className="split method__row">
                <div className="split__demo">
                  <h3 className="method__phase">{ph.name}</h3>
                  <p className="method__bring">{ph.bring}</p>
                </div>
                <div className="split__prod">
                  <p className="method__deliver">{ph.deliver}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 5 · SILENCE → RELIEF → RESOLVE: the seam sweeps to the edge */}
        <section
          id="bring"
          className="close"
          data-sc-act="pin"
          data-sc-span="3.4"
          data-seam="0.48"
          data-seam-sweep="0.48 0 0.2 0.72"
        >
          <div data-sc-stage className="close__stage">
            <div className="close__demo">
              <p className="close__claim close__claim--demo">Most AI never leaves the demo.</p>
            </div>
            <div className="close__prod">
              <h2 className="close__claim close__claim--prod">Yours will.</h2>
              <div className="close__ask">
                <Composer />
              </div>
              <footer className="close__foot">
                <span className="close__brand">
                  <Mark className="close__mark" />
                  {SITE.name}
                </span>
                <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
                <span>© 2026</span>
              </footer>
            </div>
            <SeamScene mode="close" className="close__scene" />
            <StageSeam />
          </div>
        </section>
      </main>

      <ScrollCraftMount />
    </>
  );
}
