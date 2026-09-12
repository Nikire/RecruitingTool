# Blog and Content

Guide to adding, editing and publishing an article on the Borderless blog. Articles are Markdown files in the repository, not database rows — writing one means committing a file and rebuilding the frontend, and publishing one is a single front-matter flag.

## Overview

| Thing | Where |
|-------|-------|
| Article source | `recruiting-tool-frontend/src/content/blog/*.md` |
| Loader and front-matter parser | `src/pages/blog/blogContent.ts` |
| Index page | `src/pages/blog/BlogIndexPage.tsx` → `/blog` |
| Article page | `src/pages/blog/BlogPostPage.tsx` → `/blog/:slug` |
| Prerender + sitemap registry | `scripts/prerender/routes.ts` |

Six articles ship today — four published, two drafts.

---

## Adding an article

1. Create `recruiting-tool-frontend/src/content/blog/{slug}.md`.
2. Write the front-matter block (see below), then the body in GitHub-flavored Markdown.
3. Leave `draft: true` while the article is still being reviewed.
4. Flip to `draft: false` to publish.
5. Rebuild the frontend. Nothing else is needed — the index, the prerendered HTML and the sitemap all derive from the file.

```bash
cd recruiting-tool-frontend
yarn build          # or: docker-compose up -d --build frontend
```

---

## Front matter

The block is delimited by `---` lines at the very top of the file.

```markdown
---
title: "Best ATS for Nearshore Staffing Agencies in Latin America"
slug: "best-ats-nearshore-staffing-agencies-latin-america"
description: "Nearshore staffing agencies place LATAM talent into US companies — a workflow no generic ATS was designed for."
lang: "en"
publishedAt: "2026-08-20"
updatedAt: "2026-08-20"
keywords:
  - "ats for staffing agency latin america"
  - "nearshore staffing software"
canonical: "https://borderlessats.com/blog/best-ats-nearshore-staffing-agencies-latin-america"
author: "Borderless Team"
category: "guide"
readingTimeMinutes: 9
draft: false
---
```

| Field | Required | Type | Notes |
|-------|:--------:|------|-------|
| `title` | **Yes** | string | Without it the file is skipped entirely |
| `slug` | Recommended | string | The URL segment. Falls back to the filename when missing or malformed |
| `description` | Yes in practice | string | Used as the meta description and the card subtitle |
| `lang` | Yes | `"en"` \| `"es"` | Defaults to `en`. Also selects the UI language the page is prerendered in |
| `publishedAt` | Yes | `YYYY-MM-DD` | Sort key — articles with no date sort last |
| `updatedAt` | No | `YYYY-MM-DD` | Preferred as the sitemap `lastmod` |
| `keywords` | No | list of strings | Joined into the `BlogPosting` `keywords` property |
| `canonical` | No | absolute URL | Overrides the derived `/blog/{slug}` canonical |
| `author` | No | string | Emitted as an `Organization` author, not a `Person` |
| `category` | No | string | Editorial grouping — `guide`, `comparison`, `technical`. Rendered as a chip |
| `readingTimeMinutes` | No | number | Rendered on the card and the article header |
| `draft` | **Yes** | boolean | Publication gate — see below |

`title` and a resolvable `slug` are the only hard requirements; a file missing either is dropped silently rather than crashing the build.

### `draft: true` is a hard gate

A draft is excluded from `/blog` entirely, and `getPostBySlug()` returns nothing for it **in production** — the article page renders its not-found state. Drafts resolve only in development.

This is a gate, not a hint. Two of the shipped articles — `bullhorn-alternatives-small-staffing-agencies.md` and `manatal-alternative-borderless-vs-manatal.md` — carry `VERIFY BEFORE PUBLISHING` HTML comments in their bodies flagging unverified competitor pricing and feature claims. A public page is the wrong place to discover that a pricing claim was wrong. Verify the claims before flipping the flag.

As a second line of defense the article page also passes `noindex` whenever `post.draft` is true, so even if a draft ever became reachable it would not be indexed.

---

## How the loader works

```ts
import.meta.glob("../../content/blog/*.md", { query: "?raw", import: "default", eager: true })
```

The files are **inlined into the bundle at build time**. There is no runtime fetch and no loading state on an article page. All blog routes are lazy in `App.tsx`, so those roughly 76 KB never reach the landing page.

Posts are parsed once at module load, sorted newest first, and indexed by slug.

### Why there is no MDX pipeline

The articles are plain Markdown with YAML front matter and no embedded JSX, and `react-markdown` + `remark-gfm` are already dependencies — the job detail page renders posting descriptions through them. Adding `@mdx-js/rollup` for six static documents would mean a new build plugin, a new Vite config branch and a second Markdown renderer in the bundle, in exchange for a capability the content does not use.

### Why the front-matter parser is hand-written

`gray-matter` is a Node-oriented package that pulls in a full YAML engine. The front matter here is a flat map of scalars plus one string list — a dozen lines to parse, and one fewer dependency to audit on a public, unauthenticated surface.

**The parser supports a deliberate subset of YAML:** `key: value` scalars, quoted or bare; booleans; numbers; and one level of `- item` list under a bare `key:`. Comment lines starting with `#` are ignored. Nested maps, anchors and multi-line block scalars are **not** supported. If an article ever needs one, that is the moment to reach for a real YAML parser rather than to grow this one.

---

## How an article is rendered

`BlogPostPage` renders the body with `react-markdown` and `remark-gfm`. Two things to know when writing:

- **Start body headings at `##`.** The `<h1>` is the article title rendered by the page, so Markdown `##` lands at `<h2>` and the document keeps exactly one top-level heading.
- **Tables scroll.** Markdown tables are wrapped in their own horizontally scrolling container rather than squeezing every column into a phone-width viewport.

Each article emits a `BlogPosting` JSON-LD node built in `BlogPostPage.tsx` — `headline`, `mainEntityOfPage`, `url`, `inLanguage`, a `publisher` of Borderless ATS, plus `description`, `datePublished`, `dateModified`, `author` and `keywords` when the front matter supplies them. It is built there rather than in `src/utils/structuredData.ts` because the blog is its only consumer; it still follows the same rule of never emitting an empty property.

The index page at `/blog` lists published articles as real `<a href>` links through `CardActionArea`, not click handlers, so link equity actually flows from the hub to each post.

---

## Publishing side effects

`scripts/prerender/routes.ts` imports `getPublishedPosts()` and `buildBlogPostPath()` directly from `blogContent.ts`. That means flipping `draft: false` and rebuilding does three things at once, with no separate step:

| Output | Effect |
|--------|--------|
| `/blog` | The card appears, in `publishedAt` order |
| `dist/blog/{slug}/index.html` | The article is prerendered as static HTML, in the language its `lang` declares |
| `dist/sitemap.xml` | A `<url>` entry, `changefreq: monthly`, `priority: 0.6`, `lastmod` from `updatedAt` or `publishedAt` |

Because the registry is derived from the content directory, an article cannot be published to one of those and missing from another.

Two prerenderer guards are worth knowing about while writing:

- A route whose `<title>` resolves to a raw i18n key is refused as static HTML, so the `seo.blog.*` keys the page uses must exist in both `en.json` and `es.json`.
- A route that renders `noindex` is refused too — which is exactly what happens if a draft somehow reaches the registry.

A refused route is skipped loudly and the SPA fallback still serves it. See [Prerendering and Sitemap](../seo/prerendering-and-sitemap.md).

---

## Discoverability

`/blog` is linked from the landing page footer. It is **not** in the main navbar, which carries only Home, Careers, Contact, Login and Sign Up. It is in the sitemap at `priority: 0.8`, `changefreq: weekly`.

---

## Related

- [Prerendering and Sitemap](../seo/prerendering-and-sitemap.md) - The build steps a published article flows into
- [Structured Data and Meta Tags](../seo/structured-data-and-meta.md) - The `<Seo>` contract every article page satisfies
- [Public URL Scheme](../seo/public-url-scheme.md) - The rest of the public URL space
- [Documentation index](../index.md) - Everything else
