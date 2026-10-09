// End-to-end checks for the "Plan your platform" form.
import { chromium } from "playwright-core";
const out = process.argv[2]; const url = "http://localhost:4500";
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME });
const res = {};
async function toClose(p) {
  await p.goto(url); await p.waitForTimeout(1000);
  await p.evaluate(() => { const s = document.querySelector("#bring"); scrollTo(0, s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight); });
  await p.waitForTimeout(900);
}
// 1. validation
{ const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await toClose(p); await p.locator(".composer .cta").click(); await p.waitForTimeout(1500);
  res.validation = await p.locator(".composer__error").allTextContents();
  res.focusedAfterError = await p.evaluate(() => document.activeElement?.id);
  await p.screenshot({ path: `${out}/form-errors.png` }); await p.close(); }
// 2. real send with picks (to Resend's test inbox)
{ const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(url); await p.waitForTimeout(1000);
  const pick = p.locator(".pick").nth(0); await pick.scrollIntoViewIfNeeded(); await pick.click();
  // scroll, don't reload: picks live in page memory
  await p.evaluate(() => { const s = document.querySelector("#bring"); scrollTo(0, s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight); });
  await p.waitForTimeout(900);
  res.picksInForm = await p.locator(".composer__picks").textContent().catch(() => null);
  await p.fill("#problem", "Test from the DarkOS landing page build: support team answers the same refund questions all day.");
  await p.fill("#email", "tester@example.com"); await p.fill("#company", "Acme Test");
  await p.locator(".composer .cta").click();
  await p.locator(".composer--sent").waitFor({ timeout: 15000 }).catch(() => {});
  res.sent = await p.locator(".composer--sent").textContent().catch(() => null);
  res.status = await p.locator(".composer__status").textContent().catch(() => null);
  await p.screenshot({ path: `${out}/form-sent.png` }); await p.close(); }
// 3. honeypot
{ const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await toClose(p);
  await p.fill("#problem", "Bot text bot text bot text."); await p.fill("#email", "bot@example.com");
  await p.evaluate(() => { document.querySelector("#website").value = "http://spam.example"; });
  await p.locator(".composer .cta").click(); await p.waitForTimeout(2500);
  res.honeypot = await p.locator(".composer--sent").count(); await p.close(); }
// 4. no JavaScript: validation round trip
{ const c = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p = await c.newPage(); await p.goto(url);
  await p.fill("#problem", "short"); await p.fill("#email", "nojs@example.com");
  await p.locator(".composer .cta").click(); await p.waitForLoadState("load"); await p.waitForTimeout(800);
  res.noJsUrl = p.url();
  res.noJsErrors = await p.locator(".composer__error").allTextContents();
  res.noJsKeptEmail = await p.locator("#email").inputValue().catch(() => null);
  await c.close(); }
console.log(JSON.stringify(res, null, 1)); await b.close();
