/**
 * Prerenders the public routes into static HTML files under `dist/`.
 *
 * Run after `vite build` (client) and `vite build --ssr`:
 *
 *   node scripts/prerender/prerender.mjs
 *
 * For each route it emits `dist/<route>/index.html` — a copy of the built
 * `index.html` with the app markup inside `#root`, this route's Emotion CSS
 * inlined, and the `<Seo>` head tags (title, canonical, Open Graph, JSON-LD)
 * baked in. `/` overwrites `dist/index.html`, which stays the SPA fallback for
 * every route that is NOT prerendered.
 *
 * ## Failure policy
 *
 * A route that fails to render is SKIPPED, loudly, and the build continues:
 * the SPA fallback still serves that URL exactly as it does today. A working
 * client-rendered page beats a broken prerendered one, and this script runs
 * inside the Docker image build — a hard failure here would block a deploy for
 * an SEO regression. Set `PRERENDER_STRICT=1` (CI, or when debugging) to make
 * any failure exit non-zero instead.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { installDomEnvironment } from "./dom-environment.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..", "..");
const distDir = path.join(projectRoot, "dist");
const ssrDir = path.join(projectRoot, "node_modules", ".borderless-prerender");

const STRICT = process.env.PRERENDER_STRICT === "1";
const ROUTE_TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT_MS || 30_000);

/** Marker Vite leaves untouched in the built HTML. */
const ROOT_MARKER = '<div id="root"></div>';

/**
 * Head tags in the built shell that a prerendered page replaces.
 *
 * `index.html` still declares a full default set of SEO tags, because every
 * NON-prerendered route (`/jobs/*`, `/check-status`, the auth screens) is still
 * served the plain shell and needs something sane in the head. On a prerendered
 * page those defaults would sit alongside the route's real ones — two titles,
 * two descriptions, two `og:url`s — so they are stripped here and only here.
 */
const STATIC_HEAD_PATTERNS = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s[^>]*name=["']description["'][^>]*>\s*/gi,
  /<meta\s[^>]*name=["']robots["'][^>]*>\s*/gi,
  /<meta\s[^>]*property=["']og:[^"']*["'][^>]*>\s*/gi,
  /<meta\s[^>]*name=["']twitter:[^"']*["'][^>]*>\s*/gi,
  /<link\s[^>]*rel=["']canonical["'][^>]*>\s*/gi,
];

/**
 * Reads the empty SPA shell every prerendered page is derived from, and keeps a
 * pristine copy at `dist/spa-shell.html`.
 *
 * That copy is load-bearing twice over:
 *
 *  - **nginx serves it as the catch-all.** `dist/index.html` becomes the
 *    prerendered LANDING PAGE, and a landing page is the wrong thing to hand a
 *    visitor on `/login` or a crawler on `/jobs/remote` — the latter would read
 *    home-page copy under a `rel=canonical` pointing at `/` and file the facet
 *    page as a duplicate of the home page. Routes that are not prerendered get
 *    the empty shell instead, exactly as they do today. See `nginx.conf`.
 *  - **it makes this script re-runnable.** After one pass `dist/index.html` is
 *    no longer empty, so a second `node scripts/prerender/prerender.mjs`
 *    without an intervening `vite build` would otherwise try to prerender into
 *    an already-prerendered document.
 *
 * A client build wipes `dist/`, so a shell that survives is always from this
 * same build — asset hashes included.
 */
function readTemplate() {
  const indexPath = path.join(distDir, "index.html");
  const shellPath = path.join(distDir, "spa-shell.html");

  const candidates = [indexPath, shellPath].filter((file) =>
    fs.existsSync(file),
  );
  if (candidates.length === 0) {
    throw new Error(
      `Missing ${indexPath}. Run the client build (\`vite build\`) before prerendering.`,
    );
  }

  for (const candidate of candidates) {
    const contents = fs.readFileSync(candidate, "utf8");
    if (contents.includes(ROOT_MARKER)) {
      fs.writeFileSync(shellPath, contents, "utf8");
      return contents;
    }
  }

  throw new Error(
    `Could not find ${ROOT_MARKER} in dist/index.html or dist/spa-shell.html — ` +
      "the prerenderer has nowhere to inject the app markup. Re-run the client build.",
  );
}

/**
 * Drops the tags unhead always emits that the shell already declares.
 *
 * unhead renders a `<meta charset>` and a `<meta name="viewport">` into every
 * payload. `index.html` declares both — and `charset` in particular has to stay
 * where it is, inside the first 1024 bytes of the document — so injecting
 * unhead's copies at the END of the head would leave every prerendered page
 * with two of each. Harmless to browsers, but it is exactly the kind of noise
 * that makes a page look machine-generated to an SEO audit.
 */
function dropShellDuplicates(headTags) {
  return headTags
    .split("\n")
    .filter(
      (line) =>
        !/^<meta charset=/i.test(line.trim()) &&
        !/^<meta name="viewport"/i.test(line.trim()),
    )
    .join("\n");
}

/** Applies a replacement literally: app markup contains `$&` and friends. */
function replaceOnce(haystack, needle, replacement) {
  return haystack.replace(needle, () => replacement);
}

/**
 * Builds the final document for one route.
 *
 * Emotion's CSS is prepended (immediately after `<head>`) rather than appended,
 * to mirror the runtime cascade: the client cache is created with
 * `prepend: true`, so `index.css` and the MUI overrides in the linked
 * stylesheet must keep winning ties against it.
 */
function composeHtml(template, { appHtml, css, head }) {
  let html = template;

  for (const pattern of STATIC_HEAD_PATTERNS) {
    html = html.replace(pattern, "");
  }

  if (head.htmlAttrs) {
    html = replaceOnce(html, /<html[^>]*>/i, `<html${head.htmlAttrs}>`);
  }
  if (head.bodyAttrs) {
    html = replaceOnce(html, /<body[^>]*>/i, `<body${head.bodyAttrs}>`);
  }

  if (css) {
    const headOpen = html.match(/<head[^>]*>/i)?.[0];
    if (headOpen) {
      html = replaceOnce(
        html,
        headOpen,
        `${headOpen}\n    <style data-prerender-emotion>${css}</style>`,
      );
    }
  }

  const headTags = dropShellDuplicates(head.headTags);
  if (headTags) {
    html = replaceOnce(html, "</head>", `${headTags}\n  </head>`);
  }

  html = replaceOnce(html, ROOT_MARKER, `<div id="root">${appHtml}</div>`);

  if (head.bodyTagsOpen) {
    const bodyOpen = html.match(/<body[^>]*>/i)?.[0];
    if (bodyOpen) {
      html = replaceOnce(html, bodyOpen, `${bodyOpen}${head.bodyTagsOpen}`);
    }
  }
  if (head.bodyTags) {
    html = replaceOnce(html, "</body>", `${head.bodyTags}\n  </body>`);
  }

  return html;
}

/** `/` → `dist/index.html`; `/blog/x` → `dist/blog/x/index.html`. */
function outputPathFor(route) {
  if (route === "/") return path.join(distDir, "index.html");
  const clean = route.replace(/^\/+|\/+$/g, "");
  return path.join(distDir, clean, "index.html");
}

/** First `<title>` in a fragment of HTML. */
function extractTitle(html) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? match[1].trim() : "(none)";
}

/**
 * True when a string is an i18next key that never resolved (`seo.blog.title`).
 *
 * i18next renders the raw key when a translation is missing, so a page whose
 * copy has not landed in `en.json` / `es.json` yet would otherwise be published
 * with `<title>seo.blog.post_title</title>` — worse than not prerendering it,
 * because a crawler indexes the nonsense and the correct title only reaches it
 * on some later crawl.
 */
function isUnresolvedTranslationKey(value) {
  return (
    /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i.test(value) && !value.includes(" ")
  );
}

async function main() {
  const template = readTemplate();

  const entryPath = path.join(ssrDir, "entry-server.js");
  if (!fs.existsSync(entryPath)) {
    throw new Error(
      `Missing ${entryPath}. Run \`vite build --ssr\` before prerendering.`,
    );
  }

  /*
   * IMPORT ORDER IS LOAD-BEARING — read this before changing it.
   *
   * The bundle is imported FIRST, with no `window` and no `document`, and jsdom
   * is installed only afterwards. That looks backwards and is not:
   *
   *  - Libraries that decide at MODULE-EVALUATION time see a server. Emotion is
   *    the one that matters. In browser mode it inserts styles from
   *    `useInsertionEffect`, which never runs in a string render, so every page
   *    came out with correct class names and zero CSS. In server mode it writes
   *    `<style data-emotion>` elements straight into the markup, which is
   *    exactly what a crawler and a first paint both need.
   *
   *  - Libraries that decide at RENDER time see a browser, because jsdom is in
   *    place by then. That covers the two things that hard-crashed this step:
   *    the Auth0 SDK reading `window.fetch` in its constructor, and
   *    `useNotificationSSE` reading `EventSource.OPEN` during render.
   *
   * Installing jsdom first satisfies the second group and breaks the first.
   */
  const { render, setLanguage, getPrerenderRoutes } = await import(
    pathToFileURL(entryPath).href
  );

  installDomEnvironment();

  const routes = getPrerenderRoutes();
  const failures = [];
  const rendered = [];

  for (const { path: route, lang } of routes) {
    try {
      await setLanguage(lang);
      const result = await render(route, ROUTE_TIMEOUT_MS);

      const appBytes = Buffer.byteLength(result.appHtml, "utf8");
      if (appBytes < 500) {
        throw new Error(
          `rendered only ${appBytes} bytes of markup — treating as a failed render`,
        );
      }
      if (/noindex/i.test(result.head.headTags)) {
        throw new Error(
          "route rendered a noindex page (a 404 or thin-content state) — refusing to publish it as static HTML",
        );
      }

      const title = extractTitle(result.head.headTags);
      if (isUnresolvedTranslationKey(title)) {
        throw new Error(
          `<title> came out as the raw i18n key "${title}" — the locale files are missing that key. ` +
            "Refusing to publish it; the route stays client-rendered until the key exists.",
        );
      }

      const html = composeHtml(template, result);
      const outPath = outputPathFor(route);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, "utf8");

      rendered.push({
        route,
        lang,
        appBytes,
        cssBytes: Buffer.byteLength(result.css, "utf8"),
        totalBytes: Buffer.byteLength(html, "utf8"),
        title,
        file: path.relative(projectRoot, outPath),
      });
    } catch (error) {
      failures.push({ route, error });
    }
  }

  console.log("\nPrerendered routes");
  console.log("------------------");
  for (const item of rendered) {
    console.log(
      `  ${item.route.padEnd(52)} [${item.lang}] app ${String(item.appBytes).padStart(7)}B  file ${String(
        item.totalBytes,
      ).padStart(7)}B  ${item.file}`,
    );
    console.log(`      title: ${item.title}`);
  }

  if (failures.length > 0) {
    console.warn(
      "\n!! Routes left client-rendered (SPA fallback still serves them):",
    );
    for (const failure of failures) {
      console.warn(
        `  ${failure.route}: ${failure.error?.message ?? failure.error}`,
      );
      // A one-line message is rarely enough to find which component reached for
      // a browser API that jsdom does not implement.
      if (process.env.PRERENDER_DEBUG === "1" && failure.error?.stack) {
        console.warn(failure.error.stack);
      }
    }
    console.warn("  (set PRERENDER_DEBUG=1 for stack traces)");
  }

  console.log(
    `\n${rendered.length}/${routes.length} public routes prerendered.\n`,
  );

  if (STRICT && failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\nPrerendering aborted:", error);
  console.error(
    "dist/ is untouched beyond any routes already written; the SPA shell still serves every URL.",
  );
  if (STRICT) process.exitCode = 1;
});
