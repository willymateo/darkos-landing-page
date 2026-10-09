# darkos-landing-page

Landing page of DarkOS AI. Next.js 16 (App Router) + Tailwind CSS 4, with a live
three.js scene and the scrollcraft scroll engine.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

- `app/page.tsx`: all page copy and structure (five acts).
- `app/globals.css`: tokens (colours, fonts) and every page style.
- `lib/site.ts`: name, CTA label and **the contact email** (set `contactEmail` before launch).
- `lib/seam.ts`: the demo/production divider state shared by the chrome and the 3D scenes.
- `components/SeamScene.tsx`: the WebGL brand mark, rendered twice per frame split at the seam.
- `components/Trace.tsx`: the step-by-step request trace (labelled sample data).
- `public/scrollcraft.js`, `app/scrollcraft.css`: vendored scroll engine. Do not edit; style the page instead.
- `scrollcraft/`: build brief, fingerprint registry and verification tools.
