import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHead } from "@unhead/react";

import {
  SITE_NAME,
  SITE_URL,
  serializeJsonLd,
  toAbsoluteUrl,
  type JsonLdObject,
} from "../../utils/structuredData";

/**
 * Default social share image. Matches the static `og:image` in `index.html`
 * so pages that do not override it stay consistent with the shell.
 */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/borderless-og.png`;

/** `og:locale` values keyed by the base language tag we ship. */
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  es: "es_ES",
};

/** A single `<link rel="alternate" hreflang>` target. */
export interface SeoAlternate {
  /** BCP-47 language tag (`"en"`, `"es"`) or the literal `"x-default"`. */
  hrefLang: string;
  /** Absolute URL or app-relative path. Query strings are stripped. */
  href: string;
}

export interface SeoProps {
  /**
   * Page title, rendered verbatim as `<title>` and `og:title`.
   *
   * Write keyword-led titles, not brand-led ones: "Applicant Tracking System
   * for Staffing Agencies | Borderless", never "Borderless | Home". Always pass
   * a translated string (`t("...")`) — this component never invents copy.
   */
  title: string;
  /** Meta description, 140-160 characters. Pass a translated string. */
  description: string;
  /**
   * Canonical URL override. Accepts a path or an absolute URL; query strings
   * and hashes are always stripped. Defaults to the current route's pathname.
   */
  canonical?: string;
  /**
   * One or more schema.org nodes from `utils/structuredData`. `undefined` and
   * `null` entries are dropped, so builders that may return nothing (such as
   * `buildFaqPageLd`) can be passed straight through.
   */
  jsonLd?: JsonLdObject | Array<JsonLdObject | undefined | null> | null;
  /** Emits `noindex, nofollow`. Use on gated, thin or duplicate pages. */
  noindex?: boolean;
  /** `hreflang` alternates for translated versions of this page. */
  alternates?: SeoAlternate[];
  /** `og:type`. Defaults to `"website"`. */
  ogType?: "website" | "article" | "profile";
  /** Absolute URL of the share image. Defaults to {@link DEFAULT_OG_IMAGE}. */
  ogImage?: string;
  /** Alt text for the share image. Pass a translated string. */
  ogImageAlt?: string;
  /** Twitter card type. Defaults to `"summary_large_image"`. */
  twitterCard?: "summary" | "summary_large_image";
}

/**
 * Single source of truth for per-page head tags.
 *
 * Render exactly one `<Seo>` per route, near the top of the page component.
 * It writes `<title>`, the meta description, the canonical link, Open Graph and
 * Twitter card tags, `hreflang` alternates, robots directives, `<html lang>`
 * and any JSON-LD blocks — all through `@unhead/react`, whose provider is
 * mounted in `main.tsx`.
 *
 * The canonical URL is always the absolute `https://borderlessats.com{pathname}`
 * with **search params stripped**. That matters most on `/careers`, which
 * carries eight filter params; without stripping, every filter combination
 * would be crawled and indexed as a separate duplicate page.
 *
 * @example
 * ```tsx
 * const { t } = useTranslation();
 *
 * <Seo
 *   title={t("seo.careers.title")}
 *   description={t("seo.careers.description")}
 *   jsonLd={buildOrganizationLd()}
 * />
 * ```
 */
const Seo = ({
  title,
  description,
  canonical,
  jsonLd,
  noindex = false,
  alternates,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  twitterCard = "summary_large_image",
}: SeoProps) => {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  const language = (i18n.language || "en").split("-")[0];
  const canonicalUrl = toAbsoluteUrl(canonical ?? pathname);

  const head = useMemo(() => {
    const ogLocale = OG_LOCALES[language] ?? OG_LOCALES.en;

    const alternateList = alternates ?? [];

    // Other locales this page exists in, announced to social crawlers.
    const alternateOgLocales = Array.from(
      new Set(
        alternateList
          .map((alternate) => OG_LOCALES[alternate.hrefLang.split("-")[0]])
          .filter((locale) => Boolean(locale) && locale !== ogLocale),
      ),
    );

    const meta = [
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:type", content: ogType },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: ogLocale },
      { property: "og:image", content: ogImage },
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      ...(ogImageAlt
        ? [
            { property: "og:image:alt", content: ogImageAlt },
            { name: "twitter:image:alt", content: ogImageAlt },
          ]
        : []),
      ...alternateOgLocales.map((locale) => ({
        property: "og:locale:alternate",
        content: locale,
      })),
    ];

    const link = [
      { rel: "canonical" as const, href: canonicalUrl },
      ...alternateList.map((alternate) => ({
        rel: "alternate" as const,
        hreflang: alternate.hrefLang,
        href: toAbsoluteUrl(alternate.href),
      })),
    ];

    const nodes = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(
      (node): node is JsonLdObject => Boolean(node),
    );

    return {
      title,
      htmlAttrs: { lang: language },
      meta,
      link,
      script: nodes.map((node, index) => ({
        key: `ld-json-${index}`,
        type: "application/ld+json" as const,
        // Pre-serialised and pre-escaped: a `</script>` inside a user-authored
        // job description cannot break out of the tag. See `serializeJsonLd`.
        textContent: serializeJsonLd(node),
      })),
    };
  }, [
    alternates,
    canonicalUrl,
    description,
    jsonLd,
    language,
    noindex,
    ogImage,
    ogImageAlt,
    ogType,
    title,
    twitterCard,
  ]);

  useHead(head);

  return null;
};

export default Seo;

// `SITE_URL`, `SITE_NAME`, `toAbsoluteUrl` and the JSON-LD builders live in
// `src/utils/structuredData.ts` — import them from there, not from here.
export type { JsonLdObject };
