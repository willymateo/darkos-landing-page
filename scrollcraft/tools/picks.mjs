// Picks carry from "What we build" into the closing form and the email body.
import { chromium } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:4500"); await p.waitForTimeout(1200);
const picks = p.locator(".pick");
await picks.nth(1).scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await picks.nth(1).click();
await picks.nth(3).scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await picks.nth(3).click();
const pressed = await p.locator('.pick[aria-pressed="true"]').count();
await p.screenshot({ path: process.argv[2] + "/picks-row.png" });
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
await p.locator(".hero__foot .cta").click(); await p.waitForTimeout(2200);
const shown = await p.locator(".composer__picks").textContent();
await p.fill("#problem", "Our support team answers the same refund questions all day.");
await p.fill("#company", "Acme");
const href = await p.evaluate(() => new Promise((res) => {
  const f = document.querySelector(".composer");
  const orig = Object.getOwnPropertyDescriptor(Location.prototype, "href");
  // capture the mailto the submit handler builds without navigating
  window.__mail = null;
  f.addEventListener("submit", () => setTimeout(() => res(window.__mail), 50), { once: true });
  const desc = { configurable: true, set(v) { window.__mail = v; }, get() { return location.toString(); } };
  try { Object.defineProperty(window.location, "href", desc); } catch { }
  f.requestSubmit();
})).catch(e => "ERR " + e);
await p.screenshot({ path: process.argv[2] + "/picks-close.png" });
console.log(JSON.stringify({ pressed, shown, ctaLabels: await p.locator(".cta").allTextContents(), href: href && decodeURIComponent(String(href)) }, null, 1));
await b.close();
