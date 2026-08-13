#!/usr/bin/env node
/**
 * Inlines the whole deck into one self-contained file for publishing.
 *
 *   node tools/build-single.mjs
 *
 * Produces two outputs from the same inlined content:
 *
 *   dist/deck.html      a complete standalone HTML document — email it,
 *                       drop it on a USB stick, open it anywhere
 *   dist/artifact.html  the same page as a fragment (title + styles + body
 *                       content, no <html>/<head>/<body>), which is the shape
 *                       the Artifact publisher expects
 *
 * Everything is inlined because the published page runs under a CSP that
 * blocks every external request — fonts, scripts, styles, all of it.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");

/**
 * A literal "</script>" anywhere inside inlined JS would close the tag early
 * and shatter the page. Escaping the slash is invisible to the parser and
 * changes nothing about how the JavaScript runs.
 */
const safeScript = (js) => js.replace(/<\/(script)/gi, "<\\/$1");

let html = read("index.html");

// Stylesheets -> <style>
html = html.replace(
  /[ \t]*<link rel="stylesheet" href="([^"]+)">\n?/g,
  (_, href) => `<style>\n${read(href)}\n</style>\n`
);

// Scripts -> inline, in the same order they were listed.
html = html.replace(
  /[ \t]*<script src="([^"]+)"><\/script>\n?/g,
  (_, src) => `<script>\n${safeScript(read(src))}\n</script>\n`
);

if (/<(link|script)[^>]+(href|src)=/.test(html)) {
  console.error("Something still references an external file. Not publishing that.");
  process.exit(1);
}

mkdirSync(resolve(ROOT, "dist"), { recursive: true });
writeFileSync(resolve(ROOT, "dist/deck.html"), html);

/* ---- Artifact fragment -------------------------------------------------- */

const title = /<title>([^<]*)<\/title>/.exec(html)[1];
const styles = html.match(/<style>[\s\S]*?<\/style>/g).join("\n");
const body = /<body>([\s\S]*)<\/body>/.exec(html)[1].trim();

/* The title goes first, before the ~190KB of inlined font data: only the first
   8KB of the file is scanned for it. */
const fragment = `<title>${title}</title>\n${styles}\n${body}\n`;

writeFileSync(resolve(ROOT, "dist/artifact.html"), fragment);

const mb = (s) => (s.length / 1024 / 1024).toFixed(2) + " MB";
console.log(`  dist/deck.html      ${mb(html)}  (standalone document)`);
console.log(`  dist/artifact.html  ${mb(fragment)}  (publisher fragment)`);
