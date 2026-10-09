"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

// The close is an input, not a button island: the visitor writes the problem
// down. Submitting opens their own email app with it filled in. This page
// stores nothing and sends nothing by itself, and it says so.
export default function Composer() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const form = formRef.current!;
    const section = form.closest("section")!;
    const field = form.querySelector("textarea")!;

    // "Bring a problem" links elsewhere on the page land on the resolved state
    // of the close, with the cursor already in the field.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href="#bring"]');
      if (!a) return;
      e.preventDefault();
      const top = section.getBoundingClientRect().top + scrollY;
      const end = top + section.offsetHeight - innerHeight;
      scrollTo({ top: end, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      setTimeout(() => field.focus({ preventScroll: true }), 650);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const problem = String(data.get("problem") || "").trim();
    const company = String(data.get("company") || "").trim();
    if (problem.length < 12) {
      setError("A sentence or two is enough, but we need at least that.");
      return;
    }
    setError("");
    const subject = `A problem for DarkOS AI${company ? ` from ${company}` : ""}`;
    const body = `${problem}\n\n${company ? `Company: ${company}\n` : ""}`;
    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      ref={formRef}
      className="composer"
      action={`mailto:${SITE.contactEmail}`}
      method="post"
      encType="text/plain"
      onSubmit={onSubmit}
      noValidate
    >
      <label className="composer__label" htmlFor="problem">
        What should AI be doing for your business that it isn&apos;t?
      </label>
      <textarea
        id="problem"
        name="problem"
        rows={4}
        required
        minLength={12}
        placeholder="Our support team answers the same refund questions all day, and…"
        aria-describedby="composer-help composer-error"
      />
      <div className="composer__row">
        <label className="sr-only" htmlFor="company">
          Company (optional)
        </label>
        <input id="company" name="company" type="text" autoComplete="organization" placeholder="Company (optional)" />
        <button type="submit" className="cta">
          {SITE.cta}
        </button>
      </div>
      <p id="composer-error" className="composer__error" role="alert">
        {error}
      </p>
      <p id="composer-help" className="composer__help">
        Opens your email app with this filled in, addressed to {SITE.contactEmail}. Nothing is stored on this page.
      </p>
    </form>
  );
}
