# Structured Data and Meta Tags

Reference for the page-level head contract every public page in Borderless must satisfy: the `<Seo>` component that writes the head, the schema.org JSON-LD builders that feed it, and the rules about which pages may be indexed. Read this before adding any public route — none of it is discoverable from the route table.

## The two modules

| Module | Responsibility |
|--------|----------------|
| `recruiting-tool-frontend/src/components/common/Seo.tsx` | Writes `<title>`, meta, canonical, Open Graph, Twitter, `hreflang`, robots, `<html lang>` and the JSON-LD `<script>` blocks |
| `recruiting-tool-frontend/src/utils/structuredData.ts` | The schema.org builders, the `SITE_URL` / `SITE_NAME` constants, `toAbsoluteUrl()` and `serializeJsonLd()` |

`SITE_URL` is `https://borderlessats.com`; `SITE_NAME` is `Borderless ATS`. The prerenderer and the sitemap generator both import them from `structuredData.ts`, so there is exactly one place the canonical origin is written down.

---

## The `<Seo>` contract

Render **exactly one** `<Seo>` per route, near the top of the page component. It renders nothing and returns `null`; everything it does happens through `@unhead/react`, whose provider is mounted in `main.tsx`.

| Prop | Required | Default | Notes |
|------|:--------:|---------|-------|
| `title` | Yes | — | Rendered verbatim as `<title>` and `og:title`. Always pass a translated string; the component never invents copy |
| `description` | Yes | — | Meta description, 140–160 characters. Translated string |
| `canonical` | No | The current pathname | Accepts a path or an absolute URL. Query strings and hashes are always stripped |
| `jsonLd` | No | — | One node, or an array. `undefined` and `null` entries are dropped, so a builder that may return nothing can be passed straight through |
| `noindex` | No | `false` | Emits `noindex, nofollow` |
| `alternates` | No | — | `hreflang` alternates. **Not currently used by any page** |
| `ogType` | No | `"website"` | `website`, `article` or `profile` |
| `ogImage` | No | `https://borderlessats.com/borderless-og.png` | Matches the static `og:image` in `index.html` |
| `ogImageAlt` | No | — | Adds `og:image:alt` and `twitter:image:alt` |
| `twitterCard` | No | `"summary_large_image"` | `summary` or `summary_large_image` |

### Titles

Write keyword-led titles, not brand-led ones:

```
"Applicant Tracking System for Staffing Agencies | Borderless"   ✅
"Borderless | Home"                                              ❌
```

### Canonicals

The canonical is always the absolute `https://borderlessats.com{pathname}` with **search params and hash fragments removed**, a trailing slash collapsed on everything except the root.

That stripping is load-bearing, not cosmetic. `/careers` carries nine filter parameters; without it, every filter combination would be crawled and indexed as a separate duplicate of the board. The same applies to a filtered company board. Never hand a paginated or filtered view its own canonical.

### The robots rule

A page that is **gated, thin or a duplicate** must pass `noindex`. In practice that means:

| Situation | Example in the codebase |
|-----------|------------------------|
| A soft 404 — the thing asked for does not exist | Job detail not found, company slug unresolved, blog post not found, unregistered facet, the app-wide 404 page |
| A load error that is not a missing resource | The company careers page's retry screen |
| A real page with nothing on it today | A facet index whose result count is `0` |
| A form with no indexable content, reachable without a login | `/check-status` |
| An unpublished draft | A blog post with `draft: true` |

The default when `noindex` is not passed is `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.

The prerenderer enforces this from the other side: a route whose rendered head contains `noindex` is **refused** as static HTML and left client-rendered. Passing `noindex` on a route that is in the prerender registry will therefore show up as a build warning.

### Language and hreflang

`<html lang>` is set from the active i18next language, reduced to its base tag. `og:locale` is derived from it — `en` → `en_US`, `es` → `es_ES`, defaulting to `en_US` for anything else. Each `alternates` entry adds a `<link rel="alternate" hreflang>` and, where its locale differs from the page's own, an `og:locale:alternate`.

**No page passes `alternates` today.** The machinery is in place and the app ships in two languages, but no translated-URL pairs are declared, so no `hreflang` links are emitted. Wiring them up is outstanding work, not a missing feature to document as present.

### Memoize your JSON-LD

`<Seo>` keys its head entry on the `jsonLd` value by reference. An inline object literal rewrites the document head on every render. Every caller in the codebase wraps its builder call in `useMemo`; do the same.

---

## Which page uses which builder

| Page | Route | JSON-LD |
|------|-------|---------|
| Landing | `/` | `SoftwareApplication` **+** `Organization` |
| Contact | `/contact` | `FAQPage` |
| Company careers board | `/careers/company/:slug` | `Organization`, describing the customer |
| Job detail | `/jobs/{company}/{title}-{uid}` | `JobPosting`, only while the posting is `OPEN` |
| Blog post | `/blog/:slug` | `BlogPosting` — built locally in `BlogPostPage.tsx`, not in `structuredData.ts` |
| Global careers board | `/careers` | None |
| Facet index | `/jobs/...` | None |
| Legal pages, `/check-status`, `/blog`, 404 | — | None |

`BlogPosting` lives in the blog page because the blog is its only consumer; it still follows the same rule about never emitting an empty property.

---

## The builders

All of them share one rule: **an optional property with no value is omitted entirely**, never emitted as `null`, `undefined` or `""`. Google treats a JSON-LD block with null-valued properties as broken markup, which is strictly worse than shipping none. Identifiers are always the public `uid` string; numeric database ids must never reach this module.

### `serializeJsonLd()`

Serialization must go through this function. It escapes `<`, `>` and `&` to their `\uXXXX` forms — still valid JSON, which a parser turns back into the original characters — plus U+2028 and U+2029. Job descriptions are user-authored content rendered on a public page, so an unescaped `<` inside a description is a script-tag breakout, not a cosmetic bug. `<Seo>` injects the pre-escaped string, so callers never serialize themselves.

### `buildJobPostingLd(job, options)`

The one that decides Google for Jobs eligibility. Fields it emits, and the posting fields each needs:

| JSON-LD property | Source | Notes |
|------------------|--------|-------|
| `title` | `title` | |
| `description` | `description` | |
| `identifier` | `companyName` + `uid` | A `PropertyValue`; `name` falls back to `SITE_NAME` |
| `url` | `options.url` | Defaults to `/careers/{uid}`. **Always pass the canonical `buildJobPath(...)`** |
| `datePosted` | `createdAt` | ISO 8601; an unparseable date is dropped |
| `validThrough` | `applicationDeadline` | Same |
| `employmentType` | `jobType` | Mapped, see below |
| `hiringOrganization` | `companyName`, `companyWebsite`, `companyLogoUrl` | Omitted when every field is blank |
| `jobLocation` | `city`, `state`, `country` | A `Place` with a `PostalAddress`; omitted when all three are blank |
| `jobLocationType` | `workLocation` | `TELECOMMUTE`, only when `REMOTE` |
| `applicantLocationRequirements` | `workLocation` + `country` | A `Country` node, only when `REMOTE` and a country is set |
| `baseSalary` | salary fields | Gated, see below |
| `skills`, `qualifications`, `responsibilities`, `jobBenefits` | `skills`, `requirements`, `responsibilities`, `benefits` | Joined into comma-separated text |
| `educationRequirements` | `educationLevel` | |
| `directApply` | `options.directApply` | `true` on the job detail page — the Apply dialog is on the same page, with no redirect to a third-party board |

Employment type mapping (unknown values are dropped, never guessed):

| Posting value | `employmentType` |
|---------------|------------------|
| `FULL_TIME` | `FULL_TIME` |
| `PART_TIME` | `PART_TIME` |
| `CONTRACT` | `CONTRACTOR` |
| `FREELANCE` | `CONTRACTOR` |
| `INTERNSHIP` | `INTERN` |
| `TEMPORARY` | `TEMPORARY` |

**Salary is opt-in.** `baseSalary` is emitted only when the posting's `showSalary` flag is `true` **and** at least one of `salaryMin` / `salaryMax` is a number. The flag is the recruiter's explicit consent to publish compensation, and structured data is as public as the page. The node is a `MonetaryAmount` (currency defaults to `USD`) wrapping a `QuantitativeValue` whose `unitText` maps `HOURLY` → `HOUR`, `MONTHLY` → `MONTH`, `YEARLY` → `YEAR`, defaulting to `YEAR`.

The job detail page emits this node **only while `job.status === "OPEN"`**. Google asks that expired postings drop their structured data rather than keep advertising a role nobody can be hired into.

### `buildSoftwareApplicationLd(input)`

For the marketing site. `applicationCategory` defaults to `BusinessApplication`, `operatingSystem` to `Web`, `provider` to a bare `Organization` named `Borderless ATS`. One `Offer` is emitted as an object, several as an array; prices are stringified.

`aggregateRating` is accepted but **must only carry real, verifiable ratings that are also visible on the page.** A fabricated aggregate rating is a manual-action risk. The landing page does not pass one.

The landing page derives its offers from the same `pricingPlans` array the pricing cards render, so the markup cannot drift from the prices a visitor sees. Monthly list price is quoted regardless of the billing toggle — quoting the annual-equivalent rate would read as a cheaper offer than a monthly buyer actually gets.

### `buildOrganizationLd(input)`

Every field is optional; `name` defaults to `SITE_NAME` and `url` to the site root. `contactPoint` and `address` are dropped entirely unless at least one real field inside them is set. The landing page uses it for Borderless itself (with `sameAs` and `availableLanguage: ["en", "es"]`); the company careers page uses it for the customer whose board is being rendered.

### `buildFaqPageLd(items)`

Returns `undefined` when no complete question/answer pair survives filtering — an `FAQPage` with an empty `mainEntity` is invalid markup — so the result can be passed straight to `<Seo>`, which drops `undefined`. A half-filled pair is skipped rather than emitted with nulls.

**Only emit this on a page where the same Q&A text is visible to users.** The contact page satisfies that: the four FAQ entries in the markup are the four accordions on the page.

---

## Checklist for a new public page

1. Render one `<Seo>` with a translated, keyword-led `title` and `description`.
2. Decide the canonical. If the page has filter or pagination params, do nothing — stripping is automatic. If it has a registry-built path, pass that path explicitly.
3. Pass `noindex` if the page can be gated, thin, a soft 404 or a duplicate. Add it to the error and empty branches too, not just the happy path.
4. Add JSON-LD only if a builder genuinely fits, and only for content visible on the page. Memoize it.
5. Add the route to `public/robots.txt` under the right heading — allowed, or `Disallow`ed if it is behind auth or a token.
6. Decide whether it belongs in `scripts/prerender/routes.ts`. Only unauthenticated routes may be prerendered, and a prerendered route must not emit `noindex`.
7. Make sure every `t()` key the page's title uses exists in `en.json` **and** `es.json` — the prerenderer refuses to publish a page whose `<title>` came out as a raw i18n key.

---

## Related

- [Public URL Scheme](./public-url-scheme.md) - The canonical URL shapes these tags point at
- [Prerendering and Sitemap](./prerendering-and-sitemap.md) - How these head tags get baked into static HTML
- [Blog and Content](../marketing/blog-and-content.md) - The `BlogPosting` node and the front-matter fields behind it
- [The Applicant Experience](../user-guide/applicant-experience.md) - Which public routes exist and which are indexable
- [Job Positions](../user-guide/job-positions.md) - The posting fields that feed `JobPosting`
