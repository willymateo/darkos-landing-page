// node snap.mjs <out.png> <width> <height> <selector> <offsetVh>
import { chromium } from "playwright-core";
const [out, w, h, sel, off] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto("http://localhost:4500"); await p.waitForTimeout(1200);
const y = await p.evaluate(([s, o]) => document.querySelector(s).getBoundingClientRect().top + scrollY + innerHeight * o, [sel, +off]);
await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(1600);
await p.screenshot({ path: out }); await b.close();
