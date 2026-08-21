/**
 * The URL registry shared by the prerenderer and the sitemap generator.
 *
 * This module is compiled as its own SSR entry (`routes.js` in the prerender
 * build output, see `vite.config.ts`) so the
 * sitemap can be generated WITHOUT loading React, the app tree or jsdom. That
 * separation is deliberate: sitemap generation is pure data and must never be
 * taken down by a rendering problem in one page component.
 *
 * Everything here is derived from the same modules the app renders from —
 * `blogContent` for articles, `jobFacets` for the facet registry — so a new
 * article or facet lands in the sitemap and in the prerendered output without
 * anyone remembering to edit an XML file. That is the whole reason the
 * hand-written `public/sitemap.xml` stopgap was deleted.
 */
import {
  buildBlogPostPath,
  getPublishedPosts,
} from "../../src/pages/blog/blogContent";
import { buildJobPath } from "../../src/pages/careers/careersUrls";
import { JOB_FACETS, buildFacetPath } from "../../src/pages/careers/jobFacets";
import { SITE_URL } from "../../src/utils/structuredData";

// Re-exported so the sitemap generator builds job URLs with the exact same
// slug rules the app links with — a drifted slug is a 404 in the sitemap.
export { SITE_URL, buildJobPath };

/** How often a URL's content changes, in sitemap vocabulary. */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  /** App-relative path, always starting with `/`. */
  path: string;
  /** `YYYY-MM-DD`. Defaults to the build date when omitted. */
  lastmod?: string;
  changefreq: ChangeFrequency;
  priority: number;
}

/* -------------------------------------------------------------------------- */
/* Prerendered routes                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Static public routes that are rendered to real HTML at build time.
 *
 * ONLY unauthenticated routes belong here. A page behind `<ProtectedRoute>`
 * would prerender as whatever the guard shows a logged-out visitor, and that
 * snapshot would then be served to every visitor including authenticated ones
 * for the few hundred milliseconds before the client bundle takes over.
 *
 * Also deliberately absent:
 *  - `/jobs/*` facet pages and job details — their content comes from a live
 *    API call per tenant, so a build-time snapshot would be stale the moment a
 *    role is filled. They stay client-rendered and are listed in the sitemap.
 *  - `/check-status`, `/login`, `/register` — forms with no indexable content.
 */
const STATIC_PRERENDER_ROUTES: string[] = [
  "/",
  "/careers",
  "/contact",
  "/privacy",
  "/terms",
  "/security",
  "/blog",
];

/** UI languages the app ships. */
export type PrerenderLanguage = "en" | "es";

export interface PrerenderRoute {
  path: string;
  /**
   * Language the static snapshot is rendered in.
   *
   * The prerenderer runs in Node, where i18next's browser language detector has
   * nothing meaningful to detect — it would otherwise fall back to the BUILD
   * MACHINE's locale, which is how a Spanish `<title>` ended up on the English
   * privacy policy the first time this ran. So every route states its language
   * explicitly. `en` is the default; a Spanish article is snapshotted with a
   * Spanish UI around its Spanish body.
   *
   * Visitors are unaffected either way: the client re-renders in whatever
   * language their own detector resolves.
   */
  lang: PrerenderLanguage;
}

/**
 * Every route the prerenderer should emit an `index.html` for.
 *
 * Blog articles are appended from the content directory, so publishing an
 * article (flipping `draft: false`) is enough to get it prerendered.
 */
export function getPrerenderRoutes(): PrerenderRoute[] {
  return [
    ...STATIC_PRERENDER_ROUTES.map((path) => ({
      path,
      lang: "en" as PrerenderLanguage,
    })),
    ...getPublishedPosts().map((post) => ({
      path: buildBlogPostPath(post),
      lang: (post.lang === "es" ? "es" : "en") as PrerenderLanguage,
    })),
  ];
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * URLs that exist regardless of what is in the database.
 *
 * `/register` and `/check-status` are indexable but not prerendered: they are
 * entry points we want discoverable, with no content worth snapshotting.
 */
const STATIC_SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/careers", changefreq: "daily", priority: 0.9 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/register", changefreq: "monthly", priority: 0.7 },
  { path: "/check-status", changefreq: "monthly", priority: 0.4 },
  { path: "/terms", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy", changefreq: "yearly", priority: 0.3 },
  { path: "/security", changefreq: "yearly", priority: 0.3 },
];

/**
 * Every URL the sitemap should contain, minus the per-tenant job postings
 * (which the generator appends from the public API — see
 * `scripts/prerender/generate-sitemap.mjs`).
 *
 * Two-segment facet URLs (`/jobs/engineering/colombia`) stay out on purpose:
 * most of them resolve to zero live roles on any given day, a facet page with
 * no results emits `noindex`, and submitting a noindexed URL is a Search
 * Console error rather than a neutral act. They are linked from their parent
 * facet page so a crawler still reaches the ones that have roles.
 */
export function getSitemapEntries(): SitemapEntry[] {
  const articles: SitemapEntry[] = getPublishedPosts().map((post) => ({
    path: buildBlogPostPath(post),
    lastmod: post.updatedAt || post.publishedAt,
    changefreq: "monthly",
    priority: 0.6,
  }));

  const facets: SitemapEntry[] = JOB_FACETS.map((facet) => ({
    path: buildFacetPath([facet]),
    changefreq: "daily",
    priority: 0.7,
  }));

  return [...STATIC_SITEMAP_ENTRIES, ...facets, ...articles];
}

/** XML text escape. Job titles and company names reach the `<loc>` values. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Absolute URL for a sitemap `<loc>`. The root path keeps its trailing slash. */
export function toSitemapUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Serialises entries into a sitemap document.
 *
 * Duplicate paths are dropped (first one wins) so an article that is also
 * hand-listed cannot appear twice.
 */
export function buildSitemapXml(
  entries: SitemapEntry[],
  buildDate: string,
): string {
  const seen = new Set<string>();
  const body = entries
    .filter((entry) => {
      if (seen.has(entry.path)) return false;
      seen.add(entry.path);
      return true;
    })
    .map((entry) => {
      const lastmod = entry.lastmod || buildDate;
      return [
        "  <url>",
        `    <loc>${escapeXml(toSitemapUrl(entry.path))}</loc>`,
        `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<!-- Generated by scripts/prerender/generate-sitemap.mjs. Do not edit by hand. -->",
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}
