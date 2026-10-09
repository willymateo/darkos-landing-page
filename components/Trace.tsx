"use client";

import { useEffect, useRef, useState } from "react";

// One customer request, handled twice. Everything below is sample data and the
// page says so on its face. The production column is computed from STEPS: what
// is shown, the counts and the compute time all come from this array, so the
// panel cannot drift from the numbers it reports.

const REQUEST = "My order #4471 arrived damaged. Can I get a refund?";

const DEMO_REPLY = "Absolutely! I've refunded $1,240.00 to your card. Anything else I can help with?";
const DEMO_FLAG = "The order total was $124.00. Nothing checked the amount, nothing asked for proof, nothing was logged.";

type Step = { name: string; detail: string; ms: number | null; via: "model" | "tool" | "rule" };

const STEPS: Step[] = [
  { name: "Understand", detail: "Refund request. Reason: arrived damaged.", ms: 420, via: "model" },
  { name: "Look up", detail: "Order #4471. Total $124.00. Delivered Oct 3.", ms: 180, via: "tool" },
  { name: "Check policy", detail: "Damage under $200 is approved with a photo on file.", ms: 240, via: "model" },
  { name: "Ask", detail: "Requested a photo of the damage. Photo received.", ms: null, via: "model" },
  { name: "Guardrail", detail: "Refund must not exceed the order total. Pass.", ms: 12, via: "rule" },
  { name: "Act", detail: "Refunded $124.00 to the original card. Logged.", ms: 610, via: "tool" },
  { name: "Verify", detail: "Reply checked against policy and order data.", ms: 380, via: "model" },
];

const PROD_REPLY = "Your refund of $124.00 is on its way. Thanks for sending the photo.";

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);

const WIDE = { demoReply: 0.04, flag: 0.8, stepAt: (i: number) => 0.1 + i * 0.085, reply: 0.7, phase: -1 };
const NARROW = { demoReply: 0.03, flag: 0.18, stepAt: (i: number) => 0.36 + i * 0.062, reply: 0.8, phase: 0.29 };

export default function Trace() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const section = ref.current!.closest("section")!;
    const mq = matchMedia("(max-width: 860px)");
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      setP(clamp(-r.top / Math.max(r.height - innerHeight, 1), 0, 1));
      setNarrow(mq.matches);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", kick);
      removeEventListener("resize", kick);
    };
  }, []);

  const T = narrow ? NARROW : WIDE;
  const shown = STEPS.filter((_, i) => p >= T.stepAt(i)).length;
  const done = STEPS.slice(0, shown);
  const ms = done.reduce((a, s) => a + (s.ms ?? 0), 0);
  const modelCalls = done.filter((s) => s.via === "model").length;
  const toolCalls = done.filter((s) => s.via === "tool").length;
  const replied = p >= T.reply;
  const flagged = p >= T.flag;
  const phase = narrow && p >= T.phase ? "prod" : "demo";

  return (
    <div
      ref={ref}
      className="trace"
      data-phase={phase}
      data-sc-verify-state={`trace ${shown} ${replied ? 1 : 0} ${flagged ? 1 : 0} ${phase}`}
    >
      <div className="trace__col trace__col--demo">
        <h2 className="trace__title">Same request. Different system.</h2>
        <p className="trace__side">The demo</p>
        <ol className="chat" aria-label="The demo's conversation">
          <li className="chat__msg chat__msg--user">{REQUEST}</li>
          <li className={`chat__msg chat__msg--bot ${p >= T.demoReply ? "is-on" : ""}`}>{DEMO_REPLY}</li>
        </ol>
        <p className={`trace__flag ${flagged ? "is-on" : ""}`}>{DEMO_FLAG}</p>
      </div>

      <div className="trace__col trace__col--prod">
        <p className="trace__side">In production</p>
        <p className="chat__msg chat__msg--user chat__msg--compact">{REQUEST}</p>
        <ol className="steps" aria-label="The production system's steps">
          {STEPS.map((s, i) => (
            <li key={s.name} className={`step ${i < shown ? "is-on" : ""}`}>
              <span className="step__name">{s.name}</span>
              <span className="step__detail">{s.detail}</span>
              <span className="step__ms">{s.ms === null ? "waits" : `${s.ms} ms`}</span>
            </li>
          ))}
        </ol>
        <p className={`chat__msg chat__msg--bot chat__msg--prod ${replied ? "is-on" : ""}`}>{PROD_REPLY}</p>
        <p className="trace__meter">
          <span>{shown} of {STEPS.length} steps</span>
          <span>{modelCalls} model {modelCalls === 1 ? "call" : "calls"}</span>
          <span>{toolCalls} tool {toolCalls === 1 ? "call" : "calls"}</span>
          <span>{(ms / 1000).toFixed(2)} s compute</span>
        </p>
        <p className="trace__note">Illustrative run with sample data.</p>
      </div>
    </div>
  );
}
