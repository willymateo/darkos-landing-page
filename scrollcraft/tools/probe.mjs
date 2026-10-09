// Targeted checks the act-sampling harness cannot see: the method section,
// the hero drag/keyboard handle, focus order, and the composer.
import { chromium } from "playwright-core";
const out = process.argv[2]; const url = "http://localhost:4500";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
async function ctx(w, h, extra = {}) {
  const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, ...extra });
  await c.addInitScript(() => { Element.prototype.requestPointerLock = () => {}; Element.prototype.setPointerCapture = () => {}; Element.prototype.releasePointerCapture = () => {}; });
  const p = await c.newPage(); const errs = []; p.on("console", m => m.type() === "error" && errs.push(m.text())); p.on("pageerror", e => errs.push(String(e)));
  await p.goto(url); await p.waitForTimeout(1500); return { p, errs };
}
for (const [w, h, tag] of [[1440, 900, "d"], [390, 844, "m"]]) {
  const { p, errs } = await ctx(w, h);
  // method section, top and middle
  const y = await p.evaluate(() => document.querySelector(".method").getBoundingClientRect().top + scrollY);
  for (const [k, dy] of [["a", -h * 0.3], ["b", h * 0.5], ["c", h * 1.2]]) { await p.evaluate(v => scrollTo(0, v), y + dy); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/method-${tag}-${k}.png` }); }
  // hero drag
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  const hb = await p.locator(".stage-seam__handle").boundingBox();
  const cx = hb.x + hb.width / 2, cy = hb.y + hb.height / 2;
  await p.mouse.move(cx, cy); await p.mouse.down();
  if (tag === "d") await p.mouse.move(w * 0.24, cy, { steps: 12 }); else await p.mouse.move(cx, h * 0.25, { steps: 12 });
  await p.mouse.up(); await p.waitForTimeout(700);
  const seamAfterDrag = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--seam"));
  await p.screenshot({ path: `${out}/hero-${tag}-dragged.png` });
  // keyboard on the handle
  await p.locator(".stage-seam__handle").focus(); for (let i = 0; i < 8; i++) await p.keyboard.press(tag === "d" ? "ArrowRight" : "ArrowDown");
  await p.waitForTimeout(600);
  const seamAfterKeys = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--seam"));
  const aria = await p.locator(".stage-seam__handle").getAttribute("aria-valuetext");
  await p.screenshot({ path: `${out}/hero-${tag}-keys.png` });
  // hero CTA jumps to the resolved close with the field focused
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.locator(".hero__foot .cta").click(); await p.waitForTimeout(2200);
  const focused = await p.evaluate(() => document.activeElement?.id);
  const swept = await p.evaluate(() => document.querySelector("#bring").hasAttribute("data-swept"));
  // composer validation, then a valid submit (intercept navigation to mailto)
  await p.locator(".composer .cta").click(); await p.waitForTimeout(200);
  const err = await p.locator(".composer__error").textContent();
  await p.evaluate(() => { window.__href = null; Object.defineProperty(window, "location", { value: { set href(v) { window.__href = v; } } }); }).catch(() => {});
  await p.screenshot({ path: `${out}/close-${tag}-cta.png` });
  // tab order from top
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400); await p.locator("body").focus();
  const order = []; for (let i = 0; i < 8; i++) { await p.keyboard.press("Tab"); order.push(await p.evaluate(() => { const a = document.activeElement; return (a.id || a.className || a.tagName).toString().slice(0, 30) + " @" + Math.round(a.getBoundingClientRect().top); })); }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(JSON.stringify({ tag, seamAfterDrag, seamAfterKeys, aria, focused, swept, err, order, overflow, errs }, null, 1));
  await p.context().close();
}
await b.close();
