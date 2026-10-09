// usage: node sheet.mjs <dir> [cols] [width] -> <dir>/sheet.png
import { chromium } from "playwright-core";
import fs from "node:fs"; import path from "node:path";
const dir = path.resolve(process.argv[2]); const cols = +process.argv[3] || 6; const w = +process.argv[4] || 2400;
const files = fs.readdirSync(dir).filter(f => /^\d+\.png$/.test(f)).sort((a,b)=>parseInt(a)-parseInt(b));
const html = `<html><body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},1fr);gap:4px;width:${w}px">${files.map(f=>`<figure style="margin:0;position:relative"><img src="file://${dir}/${f}" style="width:100%;display:block"><figcaption style="position:absolute;top:2px;left:4px;color:#ff0;font:bold 14px monospace;text-shadow:0 0 3px #000">${f}</figcaption></figure>`).join("")}</body></html>`;
fs.writeFileSync(path.join(dir,"sheet.html"), html);
const b = await chromium.launch({ executablePath: process.env.SCROLLCRAFT_CHROME, args:["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: w, height: 800 } });
await p.goto("file://" + path.join(dir,"sheet.html")); await p.waitForLoadState("load");
await p.screenshot({ path: path.join(dir, "sheet.png"), fullPage: true }); await b.close();
console.log(files.length, "frames ->", path.join(dir,"sheet.png"));
