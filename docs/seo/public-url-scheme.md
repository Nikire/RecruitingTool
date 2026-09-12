# Public URL Scheme

Reference for the shape of every public careers URL Borderless serves: the canonical job path, the legacy path kept alive beside it, the branded per-company board, and the closed registry of faceted job indexes. Read this before adding a public route or changing a link, because several of these URLs are deliberately non-obvious and a well-meaning "cleanup" breaks indexed links.

## The URL space at a glance

| Pattern | Page | Notes |
|---------|------|-------|
| `/careers` | Global job board | Nine filters, all in the query string |
| `/careers/company/{company-name-slug}` | One company's branded board | The URL a customer puts on their own site |
| `/careers/{uid}` | Legacy job URL | Client-side redirect to the canonical path |
| `/jobs` | — | Redirects to `/careers` |
| `/jobs/{facet}` | Faceted job index | 21 registered facets |
| `/jobs/{role-facet}/{country-facet}` | Two-dimension facet index | 13 × 8 = 104 combinations |
| `/jobs/{company-slug}/{job-title-slug}-{uid}` | A job posting | The canonical job URL |

`/jobs/a/b` is one router path serving two of those rows. See [Disambiguating the two-segment space](#disambiguating-the-two-segment-space).

---

## Canonical job URLs

```
/jobs/acme-corp/senior-react-engineer-3f8c1d2e-4b5a-6789-abcd-ef0123456789
      └ company ┘ └───── job title ─────┘ └──────────── uid ─────────────┘
```

**Only the trailing UUID is load-bearing.** The company slug and the title slug are never read back, never validated and never used to look anything up — rewrite them to anything and the same posting loads. The UID is extracted by `extractJobUid()` and handed to the existing public-by-UID endpoint, which keeps the project's UID-only external API policy intact: no numeric database id is exposed, and nothing is resolved from a human-authored string.

Both builders live in `recruiting-tool-frontend/src/pages/careers/careersUrls.ts`. Always build job links with `buildJobPath()` rather than by string concatenation — the sitemap generator imports the same function, so a hand-built link that drifts from it becomes a 404 in the sitemap.

### Why the whole UID and not a short prefix

`JobPosition.uid` is a PostgreSQL `uuid` column. Matching an 8-character prefix would need a raw `uid::text LIKE $1` query plus an ambiguity guard, because a v4 UUID prefix is not unique by construction — two colliding postings would leave one permanently unreachable. Eight visible characters is not worth a class of dead job links, and the keywords already sit in front of the UID where a reader and a crawler both meet them first.

### Slug rules

`slugify()` decomposes accents rather than dropping them, lower-cases, replaces every run of non-alphanumerics with a single hyphen, trims leading and trailing hyphens, and caps the result at **70 characters**.

| Input | Slug |
|-------|------|
| `Senior React Engineer` | `senior-react-engineer` |
| `Diseñador Gráfico` | `disenador-grafico` |
| `Acme Corp.` | `acme-corp` |
| *(empty title)* | `job` |
| *(empty company)* | `company` |

Accent decomposition is the common case here, not an edge case: Latin American job titles and company names are full of them, and dropping them would produce `dise-ador-gr-fico`.

---

## The legacy `/careers/:uid` path

Every public job used to live at `/careers/{uuid}`. Those URLs are in candidates' inboxes, in WhatsApp threads, in job ads and possibly in Google's index, so the route stays.

What it does:

- Fetches the posting, then `Navigate`s to the canonical `/jobs/...` path with `replace`, so the redirector does not trap the back button.
- A **missing or closed posting is not redirected.** It renders the job detail page's own not-found state, which emits `noindex`. Bouncing a dead job URL to the board would turn a clean soft 404 into a page that answers 200 with unrelated content.
- React Query caches by UID, so the detail page reuses the response rather than issuing a second request.

**Known limitation:** this is a client-side redirect, so a crawler sees a JavaScript redirect rather than a 301. What actually consolidates the two URLs in search is that the detail page self-canonicalises to the slugged path from either entry point. An nginx 301 would be the cleanest signal and is tracked as follow-up work, not shipped.

---

## Branded company boards

`/careers/company/{company-name-slug}` is the URL a customer links from their own website and puts in a job ad, so it carries a readable name rather than a UUID.

Resolution happens against the list the public companies endpoint already returns — nothing is queried by the raw path string. `resolveCompanyBySlug()` accepts, in order:

1. A segment containing a UID (anywhere in it) — always exact, never ambiguous.
2. An exact match on the slugified company name.

`buildCompanyCareersPath()` falls back to the company UID when a name slugifies to nothing, which is also the escape hatch when two companies share a name slug.

The page pins the board to that company by **UID**, keeps the filters in the query string, and emits an `Organization` JSON-LD node. A slug that resolves to nothing renders a not-found state with `noindex`; a failed request renders a retry screen instead, because a network error is not a missing company.

---

## The facet registry

The board filters on nine dimensions. Letting every value of every dimension become a URL — and then every combination — produces an unbounded set of near-empty pages that search engines read as doorway spam. So the indexable facet space is **closed by construction**, in `recruiting-tool-frontend/src/pages/careers/jobFacets.ts`.

### One-segment facets — `/jobs/{facet}`

21 slugs, unique across all four dimensions. The slug is what appears in the URL; the value is what is sent to the API.

| Dimension | Slug | API value |
|-----------|------|-----------|
| Work location | `remote` | `REMOTE` |
| Work location | `hybrid` | `HYBRID` |
| Work location | `onsite` | `ON_SITE` |
| Category | `engineering` | `Engineering` |
| Category | `design` | `Design` |
| Category | `marketing` | `Marketing` |
| Category | `sales` | `Sales` |
| Category | `product` | `Product` |
| Country | `argentina` | `Argentina` |
| Country | `brazil` | `Brazil` |
| Country | `chile` | `Chile` |
| Country | `colombia` | `Colombia` |
| Country | `mexico` | `Mexico` |
| Country | `peru` | `Peru` |
| Country | `uruguay` | `Uruguay` |
| Country | `united-states` | `United States` |
| Job type | `full-time` | `FULL_TIME` |
| Job type | `part-time` | `PART_TIME` |
| Job type | `contract` | `CONTRACT` |
| Job type | `internship` | `INTERNSHIP` |
| Job type | `temporary` | `TEMPORARY` |

The URL segment and the API value differ wherever the enum is ugly: `onsite` → `ON_SITE`, `full-time` → `FULL_TIME`. Category values mirror the exact strings the board's filter sidebar sends, so a facet page and the equivalent sidebar selection return identical rows.

### Two-segment facets — `/jobs/{role-facet}/{country-facet}`

A role-ish facet (category, work location or job type — 13 of them) crossed with a country (8), for 104 valid pairs. **The order is fixed**: role first, country second. `/jobs/colombia/engineering` resolves to nothing, precisely so it cannot exist as a duplicate of `/jobs/engineering/colombia`.

### What is refused

`resolveFacetPath()` returns nothing — and the page renders a not-found state with `noindex` — for:

- any slug not in the registry;
- a second segment that is not a country;
- a first segment that **is** a country, when a second segment is present.

A facet that resolves but returns **zero live postings** also emits `noindex`. Thin pages never enter the index, and they leave it again by themselves once a role is filled. The count starts as unknown rather than zero, so a facet is never noindexed just because its first response has not landed yet, and the count is reset on every facet change so a stale zero cannot leak across a navigation.

### Known limitation: accented country names

`JobPosition.country` is free text and the public API matches it with a case-insensitive `contains`, which in PostgreSQL is **not** accent-insensitive. A posting stored as "México" or "Perú" will not match the accent-free registry values above. Normalizing the column, or moving to an ISO country code, is tracked as follow-up work.

---

## Disambiguating the two-segment space

`/jobs/acme-corp/senior-react-engineer-<uid>` and `/jobs/engineering/colombia` are the same shape to a router, and React Router cannot rank two identically shaped paths. The split therefore happens in a component, `JobsTwoSegmentRoute` in `src/App.tsx`:

```
extractJobUid(secondSegment) !== null  →  JobPositionDetailPage
otherwise                              →  FacetedJobsPage(first, second)
```

The presence of a trailing UUID in the second segment is the entire discriminator. That is another reason the UID sits at the end of the job slug rather than the beginning.

`FacetedJobsPage` reads its slugs from props when the dispatcher supplies them and from the route params otherwise, so the two pages cannot disagree about what the segments are called.

---

## Canonicalization rules

Every public page renders exactly one `<Seo>` element, and that component always emits an absolute canonical of `https://borderlessats.com{pathname}` with **query strings and hash fragments stripped**.

That stripping is what makes the query-string filter design safe. `/careers` accepts nine filter params; without stripping, every filter combination would be crawled and indexed as a separate duplicate of the board. The same applies to a filtered company board.

Consequences to keep in mind when adding a page:

- A filtered or paginated view must never be given its own canonical.
- A facet page passes its registry-built path as the canonical, so the canonical and the JSON-LD `url` agree.
- The job detail page passes `buildJobPath(...)` as both its canonical and the `url` inside its `JobPosting` markup. If those two ever disagree, Google sees the posting at two URLs and picks one for you.

See [Structured Data and Meta Tags](./structured-data-and-meta.md) for the rest of the head contract.

---

## Crawl policy

`recruiting-tool-frontend/public/robots.txt` is the authority on what may be fetched. Everything behind authentication or behind a single-use token is `Disallow`ed; the marketing, careers, contact and legal surfaces are allowed. The file ends with `Sitemap: https://borderlessats.com/sitemap.xml`.

`robots.txt` controls crawling, not indexing — a page's own `noindex` is the stronger signal and always wins. The full route-by-route table is in [The Applicant Experience](../user-guide/applicant-experience.md#the-public-route-map).

---

## Related

- [Structured Data and Meta Tags](./structured-data-and-meta.md) - The `<Seo>` head contract and the JSON-LD builders
- [Prerendering and Sitemap](./prerendering-and-sitemap.md) - How these URLs become static HTML and enter `sitemap.xml`
- [The Applicant Experience](../user-guide/applicant-experience.md) - The candidate journey these URLs serve
- [Job Positions](../user-guide/job-positions.md) - How a posting reaches the public board
- [Public Endpoints](../api/public-endpoints.md) - The unauthenticated API behind every page here
