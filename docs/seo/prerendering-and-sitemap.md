# Prerendering and Sitemap

Operator guide to what `yarn build` actually does in the frontend. The command does **not** run `vite build` — it runs a four-step pipeline that also produces static HTML for the public routes and generates `dist/sitemap.xml`. If you have been treating the frontend build as a plain Vite build, this page is the correction.

## The build graph

`recruiting-tool-frontend/package.json`:

```json
"build":        "tsc -b && node scripts/prerender/build.mjs",
"build:vite":   "node scripts/prerender/build.mjs",
"build:client": "vite build",
"build:ssr":    "vite build --ssr",
"prerender":    "node scripts/prerender/prerender.mjs",
"sitemap":      "node scripts/prerender/generate-sitemap.mjs"
```

`scripts/prerender/build.mjs` runs four steps in order:

| # | Step | Output | Load-bearing? |
|---|------|--------|---------------|
| 1 | `vite build` | `dist/` — the client bundle | **Yes.** A failure stops the build. |
| 2 | `vite build --ssr` | `node_modules/.borderless-prerender/` | Everything below depends on it |
| 3 | `generate-sitemap.mjs` | `dist/sitemap.xml` | No — additive |
| 4 | `prerender.mjs` | `dist/<route>/index.html` | No — additive |

### Why it is a script and not `"a && b && c"`

The Docker image builds with `yarn build:vite -- --mode docker`. Yarn appends forwarded arguments to the **end** of the script string, so an `&&` chain would have handed `--mode docker` to the last command instead of to `vite build` — silently changing which `.env` file the client bundle was compiled against. One entry point that forwards its own argv to each step keeps the mode flag attached to every build that needs it.

### The SSR build has two entries

`vite.config.ts` emits two bundles into `node_modules/.borderless-prerender/` (inside `node_modules` on purpose: already ignored by git, ESLint and every tool that walks the source tree, so a multi-megabyte generated bundle cannot be linted, formatted, type-checked or committed):

- **`entry-server.js`** — renders public routes to HTML. Pulls in the whole React app.
- **`routes.js`** — pure data: blog front matter plus the facet registry. The sitemap generator imports only this, so generating a sitemap never depends on the app tree being renderable.

---

## Flags and environment variables

None of these appear in [Configuration](../getting-started/configuration.md); they are build-time only.

| Variable / flag | Default | Effect |
|-----------------|---------|--------|
| `--no-prerender` | off | Runs step 1 only, then exits 0 |
| `--strict-seo`, or `PRERENDER_STRICT=1` | off | A failure in steps 2–4 fails the build |
| `PRERENDER_API_URL` | falls back to `VITE_API_URL` | API base the sitemap reads job postings from. Unset means "skip job URLs" |
| `PRERENDER_SITEMAP_JOB_LIMIT` | `5000` | Maximum postings to include in the sitemap |
| `PRERENDER_SITEMAP_BUDGET_MS` | `60000` | Wall-clock budget for the whole job-fetch phase |
| `PRERENDER_TIMEOUT_MS` | `30000` | Per-route render timeout in the prerenderer |
| `PRERENDER_DEBUG=1` | off | Prints a stack trace for each failed route |

Per-request fetch timeout in the sitemap generator is a fixed 10 s, and it pages the job API 100 postings at a time.

```bash
# CI: treat any SEO-step failure as a build failure
PRERENDER_STRICT=1 yarn build

# Fast local build, no static HTML and no sitemap
yarn build:vite -- --no-prerender
```

---

## Failure policy

Steps 3 and 4 only ever **add** files next to a `dist/` that already works as a client-rendered SPA. So a failure there is reported loudly and the build still succeeds:

```
!! SEO build steps failed: prerendering.
   dist/ is a working client-rendered SPA — every route still resolves through
   the index.html fallback. Fix the step above to restore static HTML for crawlers.
```

The same logic applies per route inside the prerenderer: a route that fails to render is skipped, listed under "Routes left client-rendered (SPA fallback still serves them)", and the build carries on. A working client-rendered page beats a broken prerendered one, and this script runs inside the Docker image build — a hard failure would block a deploy over an SEO regression.

Set `PRERENDER_STRICT=1` in CI, where that trade-off reverses. Do not set it in the image build that gates a deploy.

### What counts as a failed route

The prerenderer rejects its own output in three cases, on top of a thrown error:

| Guard | Why |
|-------|-----|
| Fewer than 500 bytes of app markup | Treated as a failed render, not an empty page |
| The rendered head contains `noindex` | A 404 or thin-content state — refusing to publish it as static HTML |
| `<title>` looks like an unresolved i18n key (`seo.blog.post_title`) | The locale files are missing that key. Publishing it would put nonsense in the index, and the correct title would only arrive on some later crawl |

---

## The route registry

`scripts/prerender/routes.ts` is the single registry shared by both SEO steps. Everything in it is derived from the modules the app itself renders from — `blogContent` for articles, `jobFacets` for facets — so a new article or facet lands in both outputs without anyone editing an XML file. That is why the hand-written `public/sitemap.xml` stopgap was deleted.

### Prerendered routes

```
/  /careers  /contact  /privacy  /terms  /security  /blog
```

plus one route per **published** blog article. Flipping `draft: false` on an article is enough to get it prerendered.

**Only unauthenticated routes may be listed here.** A page behind `ProtectedRoute` would prerender as whatever the guard shows a logged-out visitor, and that snapshot would then be served to every visitor — authenticated ones included — for the few hundred milliseconds before the client bundle takes over.

Deliberately absent:

- `/jobs/*` facet pages and job detail pages. Their content comes from a live per-tenant API call, so a build-time snapshot is stale the moment a role is filled. They stay client-rendered and are listed in the sitemap instead.
- `/check-status`, `/login`, `/register` — forms with no indexable content.

### Language is explicit

Each prerendered route states its language (`en` or `es`). The prerenderer runs in Node, where i18next's browser language detector has nothing to detect and would fall back to the **build machine's** locale — which is how a Spanish `<title>` once ended up on the English privacy policy. Spanish articles are snapshotted with a Spanish UI around a Spanish body. Visitors are unaffected either way: the client re-renders in whatever language their own detector resolves.

### Sitemap entries

| Group | Count | changefreq | priority |
|-------|-------|-----------|----------|
| `/` | 1 | weekly | 1.0 |
| `/careers` | 1 | daily | 0.9 |
| `/blog` | 1 | weekly | 0.8 |
| `/contact`, `/register` | 2 | monthly | 0.7 |
| `/check-status` | 1 | monthly | 0.4 |
| `/terms`, `/privacy`, `/security` | 3 | yearly | 0.3 |
| One-segment facet indexes | 21 | daily | 0.7 |
| Published articles | varies | monthly | 0.6 |
| Job postings, fetched from the API | up to 5000 | weekly | 0.8 |

`/register` and `/check-status` are listed but not prerendered: they are entry points worth discovering with nothing worth snapshotting. Note that `/check-status` emits `noindex` on the page itself, so listing it is discovery only.

**Two-segment facet URLs are deliberately excluded.** Most resolve to zero live roles on any given day, a facet page with no results emits `noindex`, and submitting a noindexed URL is a Search Console error rather than a neutral act. They stay reachable through the links on their parent facet page.

Duplicate paths are dropped, first one wins, and `lastmod` defaults to the build date when an entry does not carry its own.

---

## Job posting URLs in the sitemap

Individual postings are per-tenant and change daily, so the generator fetches them from the public API at build time:

```
GET {PRERENDER_API_URL}/job-position/public/all?page=<n>&limit=100
```

It pages until the API runs out, the 5000-posting limit is reached, or the 60-second phase budget expires. The whole-phase budget matters as much as the per-request timeout: 5000 postings is 50 sequential requests, and a backend that is merely *slow* rather than down would otherwise hold the image build for eight minutes.

**If the API is unreachable, job URLs are simply absent from the sitemap and the static portion is still written.** This is the normal case for a Docker image built in CI, where the backend is not up yet. It is a smaller problem than it sounds: every posting is linked from `/careers` and from its facet pages, so crawlers reach them anyway. The run prints a note saying why:

```
sitemap.xml: 34 URLs (0 job postings) -> dist/sitemap.xml
  note: public job API unreachable at build time (...) — job posting URLs omitted
```

Job paths in the sitemap are built with the same `buildJobPath()` the app links with, so a drifted slug cannot turn a sitemap entry into a 404.

---

## How a prerendered page is assembled

For each route, `prerender.mjs` writes `dist/<route>/index.html`: a copy of the built `index.html` with the app markup inside `#root`, that route's Emotion CSS inlined right after `<head>`, and the `<Seo>` head tags baked in. `/` overwrites `dist/index.html`.

Two details are load-bearing:

**`dist/spa-shell.html`.** Before the first route is written, the pristine empty shell is copied aside. `dist/index.html` becomes the prerendered *landing page*, and a landing page is the wrong thing to hand a visitor on `/login` or a crawler on `/jobs/remote` — the latter would read home-page copy under a canonical pointing at `/` and file the facet page as a duplicate of the home page. `nginx.conf` therefore serves:

```nginx
try_files $uri $uri/index.html /spa-shell.html /index.html;
```

The shell copy also makes the script re-runnable: after one pass `dist/index.html` is no longer empty.

**Import order.** The SSR bundle is imported *before* jsdom is installed. That looks backwards and is not. Libraries that decide at module-evaluation time see a server — Emotion in particular, which in browser mode inserts styles from `useInsertionEffect` (never run during a string render) and produced pages with correct class names and zero CSS. Libraries that decide at render time see a browser, because jsdom is in place by then; that covers the Auth0 SDK reading `window.fetch` in its constructor and the notification SSE hook reading `EventSource.OPEN` during render.

The shell's own default `<title>`, description, robots, Open Graph, Twitter and canonical tags are stripped from prerendered pages only — `index.html` keeps them because every non-prerendered route is still served the plain shell and needs something sane in the head.

---

## In the Docker image

`recruiting-tool-frontend/Dockerfile` runs:

```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN yarn build:vite -- --mode docker
```

so the image build does the full four-step pipeline, including the sitemap fetch against whatever `VITE_API_URL` was passed as a build arg. Vite inlines `import.meta.env.VITE_*` at build time, so every `VITE_*` value — and `PRERENDER_API_URL`, if you want the sitemap to carry job URLs — has to arrive as a build argument. Setting them on the running container does nothing.

`nginx.conf` serves `/sitemap.xml` and `/robots.txt` from their own `location` blocks.

[Docker Deployment](../deployment/docker.md) describes the frontend image build without any of this; treat that page as the container reference and this one as the build reference.

---

## Verifying a build

```bash
cd recruiting-tool-frontend

# Full pipeline, strict
PRERENDER_STRICT=1 yarn build

# Which routes became static HTML?
ls dist/blog dist/careers dist/contact

# Did the sitemap pick up job postings?
grep -c "<loc>" dist/sitemap.xml

# Is the SPA fallback still empty?
grep -c 'id="root"></div>' dist/spa-shell.html
```

The prerenderer prints a table of every route it rendered, with its language, app markup size, file size and resolved `<title>`, then a `N/M public routes prerendered.` line.

---

## Related

- [Public URL Scheme](./public-url-scheme.md) - The URL shapes this pipeline prerenders and lists
- [Structured Data and Meta Tags](./structured-data-and-meta.md) - The head tags baked into each static page
- [Blog and Content](../marketing/blog-and-content.md) - How publishing an article adds it to both outputs
- [Docker Deployment](../deployment/docker.md) - The container the frontend build runs inside
- [Production Guide](../deployment/production.md) - The CI/CD pipeline around it
- [Configuration](../getting-started/configuration.md) - Runtime environment variables (the build-time ones above are not listed there)
