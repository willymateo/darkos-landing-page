"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { CAPABILITY_NAMES } from "@/lib/capabilities";
import { SITE } from "@/lib/site";

// "Plan your platform": validates the brief on the server and emails it to the
// team through Resend, with the visitor's address as reply-to.
//
// Environment:
//   RESEND_API_KEY      required
//   CONTACT_TO_EMAIL    inbox that receives inquiries (comma-separated for several)
//   RESEND_FROM_EMAIL   verified sender, e.g. "DarkOS AI <hello@your-domain>".
//                       Falls back to Resend's test sender, which can only
//                       deliver to the Resend account owner's own address.

export type InquiryValues = { problem: string; email: string; company: string; picks: string[] };

export type InquiryState = {
  status: "idle" | "error" | "sent";
  message: string;
  fieldErrors: Partial<Record<"problem" | "email" | "company", string>>;
  values: InquiryValues;
};

const LIMITS = { problem: 4000, email: 254, company: 120 };
const EMAIL_RE = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;

// Best-effort throttle per client IP. In-memory, so it resets on each server
// instance; it stops a burst from one visitor, not a determined attacker.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const field = (fd: FormData, name: string) => String(fd.get(name) ?? "").trim();

export async function sendInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const values: InquiryValues = {
    problem: field(formData, "problem").slice(0, LIMITS.problem),
    email: field(formData, "email").slice(0, LIMITS.email),
    company: field(formData, "company").slice(0, LIMITS.company),
    // Only names from the real capability list get through.
    picks: [...new Set(formData.getAll("picks").map(String))].filter((p) => CAPABILITY_NAMES.includes(p)),
  };

  // Honeypot: people never see this field, bots fill it. Pretend success.
  if (field(formData, "website")) {
    return { status: "sent", message: "", fieldErrors: {}, values };
  }

  const fieldErrors: InquiryState["fieldErrors"] = {};
  if (values.problem.length < 12) fieldErrors.problem = "A sentence or two is enough, but we need at least that.";
  if (!EMAIL_RE.test(values.email)) fieldErrors.email = "Add an email address we can reply to.";
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Check the highlighted fields.", fieldErrors, values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (throttled(ip)) {
    return {
      status: "error",
      message: `That's a few messages in a short time. Please wait a little, or write to ${SITE.contactEmail}.`,
      fieldErrors: {},
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!apiKey || !to.length) {
    console.error("[inquiry] RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return {
      status: "error",
      message: `We couldn't send that right now. Please write to ${SITE.contactEmail}.`,
      fieldErrors: {},
      values,
    };
  }

  const from = process.env.RESEND_FROM_EMAIL || "DarkOS AI <onboarding@resend.dev>";
  const who = values.company || values.email;
  const lines = [
    `From: ${values.email}`,
    values.company ? `Company: ${values.company}` : "",
    values.picks.length ? `Wants built: ${values.picks.join(", ")}` : "",
    "",
    values.problem,
  ].filter((l, i, all) => l || (i > 0 && all[i - 1]));

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: values.email,
    subject: `Platform inquiry from ${who}`,
    text: lines.join("\n"),
    html: `
      <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.55;color:#1b1813">
        <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(values.email)}</p>
        ${values.company ? `<p style="margin:0 0 4px"><strong>Company:</strong> ${escapeHtml(values.company)}</p>` : ""}
        ${values.picks.length ? `<p style="margin:0 0 4px"><strong>Wants built:</strong> ${escapeHtml(values.picks.join(", "))}</p>` : ""}
        <p style="margin:16px 0 0;white-space:pre-wrap">${escapeHtml(values.problem)}</p>
      </div>`,
  });

  if (error) {
    console.error("[inquiry] Resend error:", error.name, error.message);
    return {
      status: "error",
      message: `We couldn't send that right now. Please try again in a minute, or write to ${SITE.contactEmail}.`,
      fieldErrors: {},
      values,
    };
  }

  return { status: "sent", message: "", fieldErrors: {}, values };
}
