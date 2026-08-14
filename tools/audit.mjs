#!/usr/bin/env node
/**
 * Overflow audit.
 *
 * Slides are authored in a fixed 1280x720 box, which is exactly why content
 * that runs long is dangerous: it doesn't reflow or scroll, it just falls off
 * the bottom of the projector and nobody in the room ever sees it. Eyeballing
 * 26 screenshots misses the marginal ones.
 *
 * This walks every slide with all builds revealed, measures the real content
 * height, and reports anything that doesn't fit.
 *
 *   node tools/audit.mjs
 */

import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const PROBE = `
<script>
window.addEventListener("load", function () {
  setTimeout(function () {
    var out = [];
    var slides = document.querySelectorAll("#stage .slide");

    slides.forEach(function (slide, i) {
      // Reveal everything, exactly as the presenter will have it by the end.
      slide.classList.add("is-active");
      slide.querySelectorAll("[data-step]").forEach(function (s) {
        s.classList.add("shown");
      });

      var top = Infinity, bottom = -Infinity, right = -Infinity;
      slide.querySelectorAll("*").forEach(function (n) {
        if (n.closest(".notes")) return;
        var r = n.getBoundingClientRect();
        if (!r.width && !r.height) return;
        top = Math.min(top, r.top);
        bottom = Math.max(bottom, r.bottom);
        right = Math.max(right, r.right);
      });

      var stage = document.getElementById("stage").getBoundingClientRect();
      out.push({
        n: i + 1,
        id: slide.id,
        title: slide.getAttribute("data-title"),
        overTop: Math.round(stage.top - top),
        overBottom: Math.round(bottom - stage.bottom),
        overRight: Math.round(right - stage.right)
      });

      slide.classList.remove("is-active");
    });

    var pre = document.createElement("pre");
    pre.id = "AUDIT";
    pre.textContent = JSON.stringify(out);
    document.body.appendChild(pre);
  }, 2500);
});
</script>
`;

const html = readFileSync(resolve(ROOT, "index.html"), "utf8")
  .replace("</body>", PROBE + "</body>");

// Must sit beside index.html: the stylesheet and script srcs are relative, and
// a probe written into dist/ silently renders with no CSS at all — which makes
// every measurement below meaningless.
const probePath = resolve(ROOT, "_audit.html");
writeFileSync(probePath, html);

const dom = execFileSync(CHROME, [
  "--headless", "--disable-gpu", "--virtual-time-budget=8000",
  "--window-size=1280,720", "--dump-dom",
  "file://" + probePath
], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

rmSync(probePath, { force: true });

const match = /<pre id="AUDIT">(.*?)<\/pre>/s.exec(dom);
if (!match) {
  console.error("Audit probe did not report. Check for a JS error on load.");
  process.exit(1);
}

const rows = JSON.parse(
  match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
);

let bad = 0;
console.log("Slide overflow audit — authoring box is 1280 x 720\n");

for (const r of rows) {
  const issues = [];
  if (r.overTop > 1) issues.push(`${r.overTop}px off the top`);
  if (r.overBottom > 1) issues.push(`${r.overBottom}px off the bottom`);
  if (r.overRight > 1) issues.push(`${r.overRight}px off the right`);

  if (issues.length) {
    bad++;
    console.log(`  ✗ ${String(r.n).padStart(2, "0")} ${r.title}`);
    console.log(`       ${issues.join(", ")}`);
  }
}

console.log(bad ? `\n${bad} slide(s) overflow.` : `\nAll ${rows.length} slides fit.`);
process.exit(bad ? 1 : 0);
