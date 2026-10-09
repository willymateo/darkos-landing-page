# DarkOS AI: brief

**Self-authored under explicit creative delegation.** The owner wrote: "I like a
dark but elegant landing page. I don't have a logo, color palette or typography,
so please surprise me, analyze the essence of my business and be creative, use
your judgement." The business description and the stack (Next.js + Tailwind)
are theirs. Everything marked *authored* below is my decision, made inside that
delegation. Nothing here is an invented quotation.

## What the owner actually said (evidence)

- "DarkOS AI is a software consultant company specialized on solve business
  problems using AI technologies, building agentic platforms for production
  ready and scalable environments."
- "The page is to offer a software consultant service focus on AI."
- Look and feel: "dark but elegant".
- Assets: no logo, no palette, no typography. ("Nothing" = fully authored identity.)
- Stack: "use nextjs with tailwind".

Unknowns kept unknown: no client names, no case studies, no team size, no
figures, no contact address. The page therefore carries **no counters, no
logos wall, no testimonials, no stats**. Contact address is a single config
value the owner must set (`lib/site.ts`).

## The essence (authored)

The owner's own words carry the tension: *production ready and scalable*. The
industry problem everybody in this market recognises is that AI is easy to
demo and hard to run. A notebook that impresses a meeting is not a system that
survives real customers, real load, real money. DarkOS AI's job is the gap
between those two things.

"Dark" + "OS" reads as **the operating layer underneath**: the part nobody sees
in the demo, and the part that decides whether it works on Monday.

## The eight topics

1. **Vibe** (authored, from "dark but elegant"): *machined, quiet, exact, nocturnal.*
   References, none of them websites: the obsidian monolith in *2001: A Space
   Odyssey* (a dark object that is unarguably finished); Dieter Rams' Braun
   T3 (nothing on it that does not work); the cutaway technical drawings in
   an aircraft maintenance manual (the honest inside of a thing).
2. **Journey** (authored): the visitor first sees the split itself: their demo
   on one side, the version that runs on the other. Then the list of what the
   demo hid. Then one request handled both ways, step by step. Then how an
   engagement actually runs. Last: the line sweeps across, the demo is gone,
   and they are handed a field to describe their own problem.
3. **Energy curve** (authored): calm open, rising unease in the list, a dense
   working middle (the trace), a calm ledger, then near-silence, then the
   single loud movement of the page (the sweep), then stillness at the close.
4. **Feeling** (authored), stage by stage: see the feeling curve below. The one
   moment: the sweep.
5. **The thing no site does** (authored): the page is literally split down the
   middle into DEMO and PRODUCTION, and the visitor can grab that line and drag
   it across the brand mark, turning a jittering wireframe into solid machined
   metal wherever it passes.
6. **Distance from premium-minimal** (authored, owner asked for "elegant"):
   premium-minimal is earned here because the owner named it, tempered with
   the *technical-drawing* honesty of the demo side so it does not read as a
   luxury-goods costume. Not the cream-and-brass trap, not the AI-purple trap.
7. **One world or scenes?** (authored): neither a continuous world nor a cut
   list. **Two worlds held side by side for the whole page**, resolved at the
   end. Grammar: split stage.
8. **Assets**: none. No kie.ai key and no ffmpeg on this machine, so nothing is
   generated or encoded. The brand mark is modelled and rendered live in
   WebGL (three.js) from the same geometry as the SVG logo. This is the
   approved-collection route "use a real 3D renderer when rotation, material
   response, changing shadows materially improves the experience", and here the
   material change *is* the argument.

## Step 1 answers (authored where noted)

- **What / for whom**: a software consultancy that designs, builds and runs
  agentic AI platforms for companies that need them in production (owner's
  words, condensed).
- **What the visitor must believe by the end**: *DarkOS AI gets AI out of the
  demo and into production, and keeps it running.*
- **The one action**: describe the problem. Label, used everywhere:
  **"Bring a problem"**.

## Journey

```
1  Recognition   their demo, on the left of a line; the version that runs, on the right
2  Tension       what the demo quietly skipped, named row by row
3  Turn          one real request, handled both ways, step by step
4  Substance     how an engagement actually runs, what they bring, what we deliver
5  Commitment    the demo side is swept away; a field for their own problem
```

## Feeling curve

```
1  Curiosity     a logo split in two: wireframe and jittering on one side, solid metal on the other,
                 and a line you can grab (pin, live WebGL, layered planes, draggable seam)
2  Unease        "that's us": six rows wipe in toward the seam, demo habit against production need (reveal)
3  Clarity       one request, two systems: the demo answers instantly and wrongly, production
                 plans, checks, asks, verifies, then answers right (pin, page-computed trace)
4  Confidence    a calm ledger: you bring / we deliver, four phases, nothing loud (flow + in)
5  Silence       the seam waits, the mark is wireframe again, one line: "Most AI never leaves the demo."
   → Relief      the line sweeps all the way across, the mark hardens as it passes,
                 "Most AI never leaves the demo." becomes "Yours will." (peak)
   → Resolve     everything is production; a field and one button, held (close)
```

Adjacent states all differ. Act 5 carries three states in one pinned act because
the grammar puts the peak in the collapse and the collapse *is* the close.

## The peak

> "there's a line down the middle of the site, and at the end it sweeps all the
> way across and the wobbly wireframe logo turns into solid metal as it passes"

Lives in act 5. It gets: the largest span on the page (3.4vh against 2.8 for
the next largest), the silence before it (first ~20% of act 5 is a held,
nearly empty frame: authored, not dead scroll), and the asset budget (the
second WebGL scene exists only for it).

## Tell-someone sentence

> It's the site where **you drag a line across their logo and everything it
> passes turns from a shaky prototype into solid metal, and by the end the
> prototype side is gone.**

The signature move (draggable seam over a live split render) and the peak (the
seam's final sweep) are the same object, so they point at the same moment.

## Authored silence

- Act 5, progress 0 to ~0.2: seam held at its last position, wireframe mark,
  one line of type. Intentional. Verification should report it as a hold, not
  dead scroll.
- Act 5, progress ~0.75 to 1: resolved hold with the composer. Intentional.

## Identity (authored)

- **Mark**: a "D" whose counter holds an "O": the letters of the name, and an
  object with an inside. Same geometry in SVG and in 3D.
- **Palette**: two grounds, one per side, and one accent.
  - Demo ground `#0B0D11` (cold), production ground `#0D0B09` (warm).
  - Ink `#EDE9E2`, ink-soft `#A39E95` (warm-tinted, not flat gray).
  - Accent: warm tan `#D6B88C` (the "true off-black with warm tan" rotation).
- **Type**: Archivo (variable width, set semi-expanded for display) and Geist
  for text. Geist Mono only for data: trace steps, seam labels.

## Feel check (after build, cold)

Felt, one word per act: **curious** (hero split, the handle invites a drag),
**recognition** (gap rows), **clarity** (trace), **calm** (ledger),
**hush → relief → done** (close).

Diff against the intended curve: act 2 was meant to be *unease* and reads
closer to *recognition*: the rows are honest but polite. Left as is for now
rather than rewriting the curve; the fix, if wanted, is sharper production-side
copy (consequences, not capabilities). Peak check: the sweep is the largest
visual change on the sheets and holds the most scroll (3.4vh). The act before
it (ledger) is the quietest on the page. The last screen stands still with
content (composer + footer), no fade.

## Revision 1 (2026-10-08): owner feedback

> "the idea is not clear for the service a software consultant company offers.
> The production ready and the scalability is a feature of DarkOS AI to show our
> capability but the landing page looks like we are specialized on migrating
> projects to production... we should focus on share what we build, so the
> customers could visit our website and say: 'Ohh we need an agentic platform,
> DarkOS AI can help us building that project'"

Kept (owner liked): mark, palette, type, split design, the side-by-side trace,
"Most AI never leaves the demo. Yours will."

Changed:
- Hero now states the offer: "Not another AI demo." / "We build agentic
  platforms." plus "DarkOS AI is a software consultancy..."
- Act 2 is now **What we build**: the owner's seven capabilities (their list,
  lightly edited) on the production side, each against the shallow version it
  replaces on the demo side. Seam moves to 0.36 so production dominates.
- The "What we build" list left the method act (it moved up).
- Composer question: "What should an agent be doing for your business?"

Curve change: act 2 is now *recognition* ("that's what we need"), which is
what the feel check already reported; the intended curve is updated by the
owner's direction, not to match the build.

## Revision 2 (2026-10-08): owner feedback

Owner: "DarkOS AI is a software consultancy" is too explicit; combine the two
descriptions; replace "Not another AI demo." with the problem we solve; the
"Bring a problem" CTA reads like a support ticket; in What we build, stop
comparing with a demo and put problems on the left that the right side solves.

Changed:
- Hero: "Too much of your business still runs by hand." / "We build agentic
  platforms." Tagline: "We design, build and run agentic platforms that work
  with your tools and data, ready for production and built to scale."
- CTA everywhere: **"Plan your platform"** (planning is the honest first step
  of an engagement, and the noun is what they get).
- Seam labels page-wide: **Today / With DarkOS** (was Demo / Production). The
  trace keeps its own "The demo / In production" labels inside it.
- What we build: left column is the problem each capability solves.
- New (proposed by me, owner asked for ideas): "Add to my platform" toggles on
  each capability; the selection appears in the closing form and in the email.
