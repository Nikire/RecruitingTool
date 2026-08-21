/**
 * Generates `dist/sitemap.xml` at build time.
 *
 * Replaces the hand-written `public/sitemap.xml` stopgap, which had to be kept
 * in sync by hand with `src/App.tsx`, `src/pages/careers/jobFacets.ts` and
 * `src/content/blog/*.md` — three files that change for unrelated reasons. The
 * static routes, the 21 job facet indexes and the published articles are now
 * all derived from those same modules (see `scripts/prerender/routes.ts`), so
 * they cannot drift.
 *
 * ## Job posting URLs
 *
 * Individual postings are per-tenant and change daily, so they are fetched from
 * the public API at build time when it is reachable. If it is not — the usual
 * case for a Docker image built in CI, where the backend is not up yet — the
 * static portion is still written and the job URLs are simply absent. That is
 * a smaller problem than it sounds: every posting is linked from `/careers` and
 * from its facet pages, so crawlers reach them anyway.
 *
 * Environment:
 *   PRERENDER_API_URL            API base to read postings from. Falls back to
 *                                VITE_API_URL (which the Dockerfile already
 *                                sets). Unset means "skip job URLs".
 *   PRERENDER_SITEMAP_JOB_LIMIT  Maximum postings to include (default 5000).
 *   PRERENDER_SITEMAP_BUDGET_MS  Wall-clock budget for the whole fetch phase
 *                                (default 60000).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..", "..");
const distDir = path.join(projectRoot, "dist");
const routesEntry = path.join(
  projectRoot,
  "node_modules",
  ".borderless-prerender",
  "routes.js",
);

const API_BASE = (
  process.env.PRERENDER_API_URL ||
  process.env.VITE_API_URL ||
  ""
).replace(/\/+$/, "");
const JOB_LIMIT = Number(process.env.PRERENDER_SITEMAP_JOB_LIMIT || 5000);
const PAGE_SIZE = 100;
const FETCH_TIMEOUT_MS = 10_000;
const TOTAL_BUDGET_MS = Number(
  process.env.PRERENDER_SITEMAP_BUDGET_MS || 60_000,
);

/** `YYYY-MM-DD` for today, in UTC. */
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Digs the posting array out of the response.
 *
 * The API is read here with plain `fetch`, without the axios response
 * normaliser the app installs, so the payload may or may not be wrapped in a
 * `{ success, data }` envelope depending on the interceptor chain in front of
 * it. Both shapes are accepted rather than assumed.
 */
function extractJobs(payload) {
  const candidates = [
    payload?.data?.data,
    payload?.data,
    payload?.items,
    payload,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function extractTotalPages(payload) {
  const source = payload?.data ?? payload;
  const totalPages = Number(source?.totalPages);
  return Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
}

async function fetchJobPostings() {
  if (!API_BASE) {
    return {
      jobs: [],
      note: "no PRERENDER_API_URL / VITE_API_URL set — job posting URLs omitted",
    };
  }

  const jobs = [];
  // Whole-phase budget. The per-request timeout alone is not enough: 5000
  // postings is 50 sequential requests, and a backend that is merely SLOW
  // rather than down would hold the Docker image build for eight minutes.
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  try {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && jobs.length < JOB_LIMIT) {
      if (Date.now() > deadline) {
        return {
          jobs,
          note: `job fetch exceeded its ${TOTAL_BUDGET_MS / 1000}s budget — sitemap includes the ${jobs.length} postings read so far`,
        };
      }

      const url = `${API_BASE}/job-position/public/all?page=${page}&limit=${PAGE_SIZE}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} for ${url}`);
      }

      const payload = await response.json();
      const batch = extractJobs(payload);
      if (batch.length === 0) break;

      jobs.push(...batch);
      totalPages = extractTotalPages(payload);
      page += 1;
    }

    return { jobs: jobs.slice(0, JOB_LIMIT), note: null };
  } catch (error) {
    return {
      jobs: [],
      note: `public job API unreachable at build time (${error?.message ?? error}) — job posting URLs omitted`,
    };
  }
}

async function main() {
  if (!fs.existsSync(routesEntry)) {
    throw new Error(
      `Missing ${routesEntry}. Run \`vite build --ssr\` before generating the sitemap.`,
    );
  }

  const { getSitemapEntries, buildSitemapXml, buildJobPath } = await import(
    pathToFileURL(routesEntry).href
  );

  const buildDate = todayIso();
  const entries = getSitemapEntries();

  const { jobs, note } = await fetchJobPostings();
  for (const job of jobs) {
    if (!job?.uid) continue;
    entries.push({
      path: buildJobPath({
        uid: job.uid,
        title: job.title,
        companyName: job.companyName,
      }),
      lastmod: (job.updatedAt || job.createdAt || "").slice(0, 10) || buildDate,
      changefreq: "weekly",
      priority: 0.8,
    });
  }

  const xml = buildSitemapXml(entries, buildDate);

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");

  const urlCount = (xml.match(/<loc>/g) || []).length;
  console.log(
    `\nsitemap.xml: ${urlCount} URLs (${jobs.length} job postings) -> dist/sitemap.xml`,
  );
  if (note) console.log(`  note: ${note}`);
}

main().catch((error) => {
  console.error("\nSitemap generation failed:", error);
  process.exitCode = 1;
});
