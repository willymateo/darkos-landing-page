"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions/inquiry";
import { usePicks } from "@/lib/picks";
import { SITE } from "@/lib/site";

// The close is an input, not a button island: the visitor writes the problem
// down and it goes straight to the team (Server Action + Resend). Picks made in
// "What we build" ride along as hidden fields. Without JavaScript the form
// still posts to the same action and the page renders the result.

const INITIAL: InquiryState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: { problem: "", email: "", company: "", picks: [] },
};

export default function Composer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const livePicks = usePicks();
  const [state, formAction, pending] = useActionState(sendInquiry, INITIAL);
  const picks = livePicks.length ? livePicks : state.values.picks;
  const fe = state.fieldErrors;

  useEffect(() => {
    const section = wrapRef.current!.closest("section")!;
    // "Plan your platform" links elsewhere on the page land on the resolved
    // state of the close, with the cursor already in the field.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href="#bring"]');
      if (!a) return;
      e.preventDefault();
      const top = section.getBoundingClientRect().top + scrollY;
      const end = top + section.offsetHeight - innerHeight;
      scrollTo({ top: end, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      setTimeout(() => section.querySelector<HTMLElement>("#problem, .composer--sent")?.focus({ preventScroll: true }), 650);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (state.status === "sent") sentRef.current?.focus({ preventScroll: true });
    if (state.status === "error") {
      const first = fe.problem ? "#problem" : fe.email ? "#email" : null;
      if (first) wrapRef.current?.querySelector<HTMLElement>(first)?.focus({ preventScroll: true });
    }
  }, [state, fe.problem, fe.email]);

  if (state.status === "sent") {
    return (
      <div ref={wrapRef}>
        <div ref={sentRef} className="composer composer--sent" role="status" tabIndex={-1}>
          <p className="composer__label">Thanks. Your brief is with our team.</p>
          <p className="composer__sent-body">
            We&apos;ll reply to <strong>{state.values.email}</strong>
            {state.values.picks.length ? ` about ${state.values.picks.join(", ")}` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef}>
      <form className="composer" action={formAction} noValidate aria-busy={pending}>
        <label className="composer__label" htmlFor="problem">
          What should an agent be doing for your business?
        </label>
        {picks.length ? (
          <p className="composer__picks" aria-live="polite">
            <span>Your platform:</span> {picks.join(", ")}
          </p>
        ) : null}
        {picks.map((p) => (
          <input key={p} type="hidden" name="picks" value={p} />
        ))}

        <textarea
          id="problem"
          name="problem"
          rows={4}
          required
          minLength={12}
          maxLength={4000}
          defaultValue={state.values.problem}
          placeholder="Our support team answers the same refund questions all day, and…"
          aria-invalid={fe.problem ? true : undefined}
          aria-describedby={fe.problem ? "problem-error" : undefined}
        />
        {fe.problem ? (
          <p id="problem-error" className="composer__error">
            {fe.problem}
          </p>
        ) : null}

        <div className="composer__row">
          <div className="composer__field">
            <label className="sr-only" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              defaultValue={state.values.email}
              placeholder="Work email"
              aria-invalid={fe.email ? true : undefined}
              aria-describedby={fe.email ? "email-error" : undefined}
            />
            {fe.email ? (
              <p id="email-error" className="composer__error">
                {fe.email}
              </p>
            ) : null}
          </div>
          <div className="composer__field">
            <label className="sr-only" htmlFor="company">
              Company (optional)
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={120}
              defaultValue={state.values.company}
              placeholder="Company"
            />
          </div>
        </div>

        {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
        <div className="composer__trap" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="composer__send">
          <button type="submit" className="cta" disabled={pending}>
            {pending ? "Sending…" : SITE.cta}
          </button>
          <p className="composer__help">Goes straight to our team. We reply by email.</p>
        </div>
        <p className="composer__status" role="alert">
          {state.status === "error" && !Object.keys(fe).length ? state.message : ""}
        </p>
      </form>
    </div>
  );
}
