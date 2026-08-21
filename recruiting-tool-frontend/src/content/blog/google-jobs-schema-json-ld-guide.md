---
title: "Google Jobs Schema for Your Careers Page: A Practical JSON-LD Guide"
slug: "google-jobs-schema-json-ld-guide"
description: "A working guide to JobPosting JSON-LD: the required properties, the ones Google actually rewards, the remote-work fields almost everyone gets wrong, and the escaping bug that turns a job description into an XSS hole."
lang: "en"
publishedAt: "2026-08-20"
updatedAt: "2026-08-20"
keywords:
  - "job posting schema markup"
  - "jobposting json-ld"
  - "google jobs structured data"
  - "google for jobs schema"
  - "careers page seo"
canonical: "https://borderlessats.com/blog/google-jobs-schema-json-ld-guide"
author: "Borderless Team"
category: "technical"
readingTimeMinutes: 10
draft: false
---

If your job pages do not emit valid `JobPosting` structured data, they cannot appear in the Google Jobs experience. Not "will rank poorly" — are not eligible at all. For a recruiting agency or an in-house team running its own careers page, that is usually the single highest-leverage SEO fix available, and it is a day of work rather than a quarter of content marketing.

This guide is the practical version: what to emit, what to skip, and the four mistakes that account for most broken implementations we see.

## Where the markup goes

Use JSON-LD in a `<script type="application/ld+json">` tag. Google supports microdata too, but JSON-LD is a self-contained block that does not entangle your markup with your React component tree, and it is what Google recommends.

One block per job, on the job's own detail page. Do not put ten `JobPosting` objects on a listing page hoping the listing itself ranks — that is not how the feature works. Each posting needs its own indexable URL.

```html
<script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "JobPosting", "...": "..." }
</script>
```

## The required properties

Google requires these five. Miss any one and the posting is ineligible:

| Property             | Notes                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `title`              | The job title alone — "Senior Backend Engineer", not "Senior Backend Engineer - Apply Now! - Acme" |
| `description`        | The full description. HTML formatting is allowed and encouraged                                    |
| `datePosted`         | ISO 8601 date                                                                                      |
| `hiringOrganization` | An `Organization` with at least a `name`                                                           |
| `jobLocation`        | A `Place` with a `PostalAddress` — or, for fully remote roles, see the remote section below        |

And one that is technically optional but behaves as though it is required: **`validThrough`**. Without it, Google has no idea when the role expired, and stale postings are demoted and eventually dropped. Set it from your application deadline. If you do not collect a deadline, collect one.

## A complete, realistic example

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Backend Engineer",
  "description": "<p>We are hiring a senior backend engineer to work on our payments platform...</p><h3>Requirements</h3><ul><li>5+ years with Node.js</li></ul>",
  "identifier": {
    "@type": "PropertyValue",
    "name": "Acme Talent",
    "value": "b3f1c2de-5a77-4c19-9b8e-2f6d1a4e7c30"
  },
  "url": "https://example.com/careers/b3f1c2de-5a77-4c19-9b8e-2f6d1a4e7c30",
  "datePosted": "2026-08-20",
  "validThrough": "2026-10-01",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Acme Talent",
    "sameAs": "https://acmetalent.com",
    "logo": "https://acmetalent.com/logo.png"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bogotá",
      "addressRegion": "Cundinamarca",
      "addressCountry": "CO"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 60000,
      "maxValue": 85000,
      "unitText": "YEAR"
    }
  },
  "skills": "Node.js, PostgreSQL, AWS",
  "qualifications": "5+ years backend experience; fluent English",
  "responsibilities": "Design and ship payment services; mentor two engineers",
  "jobBenefits": "Private health insurance; annual learning budget",
  "directApply": true
}
```

Every property below `validThrough` is optional. They are still worth emitting, for a reason worth understanding: Google's job search UI exposes filters for salary, employment type and remote status. A posting that omits salary simply does not appear when a candidate filters by it. Optional properties are not decoration — they are eligibility for filtered queries, which are the highest-intent queries there are.

## The four mistakes that break implementations

### 1. Emitting `null` for empty optional properties

This is the most common failure and the most damaging, because it is invisible. A templating layer that produces:

```json
{ "validThrough": null, "baseSalary": null, "employmentType": "" }
```

is worse than one that omits those keys entirely. Google treats null-valued or empty-string properties as malformed markup, and a malformed block can invalidate the whole posting — so a page with three empty fields ends up performing worse than a page with no markup at all.

**The rule: build the object by omission.** If a value is absent, the key must not exist. Any serious implementation runs the object through a compaction step that strips `undefined`, `null` and `""` before serialising. If you are writing this yourself, write that helper first.

### 2. Not escaping the description

This one is a security bug, not just an SEO bug, and it is startlingly common.

Job descriptions are user-authored content. If a recruiter — or an attacker with a careers-portal login — writes a description containing `</script>`, and you interpolate it into a `<script type="application/ld+json">` block, the browser closes your script tag early and executes whatever follows as markup. That is stored cross-site scripting on your public careers page.

`JSON.stringify()` alone does **not** save you. It escapes quotes; it does not escape `<`. The fix is to escape the angle brackets and ampersand into their `\uXXXX` forms after stringifying. They remain valid JSON — a parser converts them straight back — but they can no longer terminate a tag:

```js
function serializeJsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
```

U+2028 and U+2029 are included because they are legal inside a JSON string but illegal raw in a JavaScript context, and they will break parsing in some environments.

If you take one thing from this article, take this function.

### 3. Getting remote roles wrong

Remote is where most agency postings fail, and the rules are unintuitive.

For a **fully remote** role, do not invent a fake office address, and do not use `"addressLocality": "Remote"`. Instead:

```json
{
  "jobLocationType": "TELECOMMUTE",
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "Colombia"
  }
}
```

`applicantLocationRequirements` is what tells Google where a candidate must be legally able to work. For a nearshore role open to candidates across a region, list the countries. Omitting it on a remote posting is a real loss: candidate searches are geographically filtered, so a remote job with no location signal at all reaches almost nobody.

For a **hybrid** role, emit a real `jobLocation` with the office address, and do not set `jobLocationType`. Hybrid is a location-based job with flexibility, not a telecommute job.

### 4. Mismatched or non-canonical URLs

The `url` property, the page's `<link rel="canonical">` and the URL you submit in your sitemap must all agree. Careers boards typically accept filter parameters — `?department=eng&location=remote` — and every combination is a separate indexable URL unless you normalise. Strip query strings and hash fragments from the canonical, collapse trailing slashes, and pick one form.

Use the **public UID** in the URL, never a sequential database id. `/careers/1`, `/careers/2`, `/careers/3` publishes your hiring volume to any competitor who can count, and it makes record enumeration trivial.

## How to validate before you ship

Three tools, in this order:

1. **[Google Rich Results Test](https://search.google.com/test/rich-results)** — paste the live URL. This is the authoritative check for eligibility. It renders JavaScript, so it works on client-rendered pages.
2. **[Schema Markup Validator](https://validator.schema.org/)** — checks schema.org validity in general, beyond Google's specific requirements.
3. **Search Console → Job Postings report** — the only tool that shows what Google actually did with your pages once they are live. Check it a week after launch, then monthly.

A caveat worth knowing: if your careers page is a client-rendered single-page app, Google can index it, but rendering is queued and slower than for server-rendered HTML. Server-side rendering the job detail page is the more reliable choice if you have the option. Either way, verify with the Rich Results Test on the live URL rather than trusting your local build.

## Do not spam the markup

Two rules that get sites penalised:

**The markup must match the visible page.** If your JSON-LD says the salary is $85,000 and the page body does not mention salary, that is a structured data violation. Everything in the markup should be visible to a human reading the page.

**Remove expired postings.** When a role closes, either take the page down (410 or 404), remove the `JobPosting` markup, or set `validThrough` to a past date. Leaving filled roles marked up as open is one of the fastest ways to lose the feature entirely.

## If you would rather not build this

Every point in this article is implemented in the Borderless careers board. Job pages emit compacted `JobPosting` markup with no null values, escaped descriptions, `TELECOMMUTE` plus applicant location requirements for remote roles, salary ranges, skills, qualifications, responsibilities, benefits, `validThrough` from the application deadline, `directApply`, and canonical URLs built on the public UID with query parameters stripped.

You can see it working on any live posting — [browse the jobs published on Borderless careers boards](/jobs), open one, and view source. Or run one through the Rich Results Test yourself; that is a better argument than anything we could write here.

Publishing a role takes a few minutes: create the job position, publish it to your careers board, and the markup is generated from the fields you already filled in. The 30-day trial includes the full careers board.

---

The short version: emit all five required properties plus `validThrough`, never emit `null`, escape the description properly, get the remote fields right, keep the URLs canonical, and validate on the live page. That is most of the distance between a careers page that collects applications and one that generates them.
