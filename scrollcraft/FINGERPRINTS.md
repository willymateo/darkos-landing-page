# Fingerprints

Every site you build with **scroll-craft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| darkos (2026-10-08) | Split stage | No bar. A fixed seam line labelled DEMO / PRODUCTION with a page-progress tick; on phones a top balance bar | Live WebGL brand mark rendered through two scissor passes split at the seam (wireframe prototype vs machined metal), 4 depth planes, draggable seam | 5 acts, 10.5vh: pin(1.7) > reveal rows (flow) > pin trace(2.8) > flow+in ledger > pin sweep(3.4) | Seam sweeps to the edge, demo claim wiped into "Yours will.", a written-problem composer (mailto) held in the production column | Drag the seam across the logo: everything it passes turns from jittering wireframe to solid metal | Rendered 3D, low-key dark, cold/warm grounds, tan accent | Next.js 16 + Tailwind 4 |


---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Split stage** grammar with a seam as the only chrome (darkos).
- **Draggable seam over a two-pass WebGL render** as signature move (darkos).
- **Close as a written-problem composer**, not a button island (darkos).
- 5 acts at ~10.5vh with the peak in the closing pin (darkos).

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scroll-craft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
