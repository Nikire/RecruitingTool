/**
 * The production build pipeline.
 *
 *   1. `vite build`              — the client bundle (unchanged, QA-tuned chunks)
 *   2. `vite build --ssr`        — the prerender/sitemap bundles, emitted to
 *                                  node_modules/.borderless-prerender/
 *   3. generate-sitemap.mjs      — dist/sitemap.xml
 *   4. prerender.mjs             — static HTML for the public routes
 *
 * ## Why this is a script and not `"build": "a && b && c"`
 *
 * The Docker image builds with `yarn build:vite -- --mode docker`. Yarn appends
 * forwarded arguments to the END of the script string, so an `&&` chain would
 * have handed `--mode docker` to the LAST command instead of to `vite build` —
 * silently changing which `.env` file the client bundle is compiled against.
 * A single entry point that forwards its own argv to each step keeps the mode
 * flag attached to every build that needs it.
 *
 * ## Failure policy
 *
 * Steps 1 and 2 are load-bearing: if the client bundle fails to build there is
 * nothing to deploy, so the pipeline stops. Steps 3 and 4 are additive — they
 * only ever ADD static files next to a `dist/` that already works as a
 * client-rendered SPA — so a failure there is reported loudly and the build
 * still succeeds. Pass `--strict-seo` (or set `PRERENDER_STRICT=1`) to fail the
 * build on an SEO-step failure instead; recommended in CI, not in the image
 * build that gates a deploy.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..", "..");
const viteBin = path.join(
  projectRoot,
  "node_modules",
  "vite",
  "bin",
  "vite.js",
);

const rawArgs = process.argv.slice(2);
const skipSeo = rawArgs.includes("--no-prerender");
const strict =
  rawArgs.includes("--strict-seo") || process.env.PRERENDER_STRICT === "1";

/** Arguments meant for Vite: everything this script does not consume itself. */
const viteArgs = rawArgs.filter(
  (arg) => arg !== "--no-prerender" && arg !== "--strict-seo",
);

/** Runs a node process, inheriting stdio. Returns its exit code. */
function run(label, args, env = {}) {
  console.log(`\n> ${label}`);
  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });

  if (result.error) {
    console.error(`  ${label} could not start:`, result.error.message);
    return 1;
  }
  return result.status ?? 1;
}

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

// 1. Client bundle. Non-negotiable.
if (run("vite build", [viteBin, "build", ...viteArgs]) !== 0) {
  fail("Client build failed. Nothing was deployed.");
}

if (skipSeo) {
  console.log("\nSkipping prerender + sitemap (--no-prerender).");
  process.exit(0);
}

const seoEnv = strict ? { PRERENDER_STRICT: "1" } : {};
const failures = [];

// 2. SSR bundles. Everything below depends on them.
if (run("vite build --ssr", [viteBin, "build", ...viteArgs, "--ssr"]) !== 0) {
  failures.push("SSR bundle build");
} else {
  // 3. Sitemap: pure data, no DOM, no React.
  if (
    run(
      "generate sitemap",
      [path.join(scriptDir, "generate-sitemap.mjs")],
      seoEnv,
    ) !== 0
  ) {
    failures.push("sitemap generation");
  }

  // 4. Static HTML for the public routes.
  if (run("prerender", [path.join(scriptDir, "prerender.mjs")], seoEnv) !== 0) {
    failures.push("prerendering");
  }
}

if (failures.length > 0) {
  console.warn(
    `\n!! SEO build steps failed: ${failures.join(", ")}.\n` +
      "   dist/ is a working client-rendered SPA — every route still resolves through\n" +
      "   the index.html fallback. Fix the step above to restore static HTML for crawlers.",
  );
  if (strict) process.exit(1);
}

console.log("\nBuild complete.");
