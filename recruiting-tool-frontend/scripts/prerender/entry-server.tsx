/**
 * Server entry for build-time prerendering (SSG).
 *
 * ## Why this file exists
 *
 * Every route used to be client-rendered, so nginx served a byte-identical
 * empty `#root` shell for `/`, `/careers`, `/contact` and the blog. Googlebot
 * renders JavaScript on a deferred queue with no timing guarantee; Bing,
 * LinkedIn's unfurler and most LLM crawlers do not render JavaScript at all.
 * Every `<Seo>` title, canonical, JSON-LD block and article body was therefore
 * invisible to them. This entry renders the public routes to real HTML at build
 * time so the markup exists before a single byte of JS runs.
 *
 * ## What it deliberately mirrors — and what it does not
 *
 * The provider stack below is the same one `src/main.tsx` mounts, in the same
 * order, with three differences:
 *
 *  1. `<BrowserRouter>` becomes `<StaticRouter location>`; there is no history.
 *  2. `<ErrorBoundary>` is omitted ON PURPOSE. In the browser it turns a render
 *     crash into a friendly fallback; here it would turn a render crash into a
 *     silently published fallback page. The prerenderer must fail loudly for
 *     the route instead, so `scripts/prerender/prerender.mjs` can skip it and
 *     leave the plain SPA shell in place.
 *  3. A `<CacheProvider>` holding a PER-RENDER Emotion cache is added. Emotion
 *     emits each rule exactly once per cache, so a shared cache would style the
 *     first route and leave every later one bare. It must also be a cache we
 *     own rather than MUI's default: MUI marks its cache `compat`, which makes
 *     Emotion route the rules to `cache.inserted` for `@emotion/server` to
 *     extract instead of writing `<style>` tags into the markup. A page that
 *     paints unstyled until the client bundle boots trades one SEO problem for
 *     a worse UX one.
 *
 * `<StrictMode>` is omitted because its double-invoke is a development-only
 * correctness check with no meaning in a single-pass string render.
 *
 * ## The output is NOT hydrated
 *
 * `src/main.tsx` still calls `createRoot().render()`, which discards this
 * markup and renders from scratch. That is the deliberate trade: crawlers get
 * real HTML, and the running app keeps byte-for-byte its current client-render
 * behaviour with zero hydration-mismatch surface (i18n language detection and
 * `localStorage`-backed theme alone would guarantee mismatches). See the note
 * in `src/main.tsx`.
 */
import type { ReactElement } from "react";
import { PassThrough } from "node:stream";

import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import type { EmotionCache } from "@emotion/cache";
import {
  UnheadProvider,
  createHead,
  renderSSRHead,
} from "@unhead/react/server";

import App from "../../src/App";
import ThemeWrapper from "../../src/providers/ThemeWrapper";
import Auth0ProviderWithNavigate from "../../src/providers/Auth0ProviderWithNavigate";

// Registers resources so `t()` resolves during the render instead of echoing
// raw dotted keys into the HTML. The module also runs i18next's BROWSER
// language detector on import, which in Node resolves against the build
// machine's locale — see `setLanguage`.
import i18n from "../../src/i18n/i18n";

export { getPrerenderRoutes } from "./routes";

/**
 * The app's i18next instance.
 *
 * Exported so build tooling can inspect or seed translations without reaching
 * for its own copy of i18next — the bundle contains its own, and a second
 * instance would share no resources with the one the components read from.
 */
export { i18n };

/**
 * Pins the language for the next render.
 *
 * Must be awaited before `render()`: i18next's detector picked something
 * arbitrary at import time (the build machine's locale), and a snapshot in the
 * wrong language is worse than no snapshot — it is the wrong `<title>`, the
 * wrong meta description and the wrong `<html lang>` served to crawlers.
 */
export async function setLanguage(language: string): Promise<void> {
  if (i18n.resolvedLanguage === language) return;
  await i18n.changeLanguage(language);
}

/** Head markup produced by unhead for one route. */
export interface RenderedHead {
  /** `<title>`, meta, link and JSON-LD `<script>` tags, already serialised. */
  headTags: string;
  /** Attribute string for `<html>`, e.g. ` lang="en"`. */
  htmlAttrs: string;
  /** Attribute string for `<body>`. */
  bodyAttrs: string;
  /** Tags unhead wants at the end of `<body>`. */
  bodyTags: string;
  /** Tags unhead wants immediately after `<body>`. */
  bodyTagsOpen: string;
}

export interface RenderResult {
  /** Markup for the contents of `<div id="root">`. */
  appHtml: string;
  /** CSS Emotion produced for this route, ready to inline in a `<style>`. */
  css: string;
  head: RenderedHead;
}

/**
 * Renders a React tree to a complete HTML string.
 *
 * Uses `renderToPipeableStream` + `onAllReady` rather than `renderToString`
 * because every public route below `/blog` and half of `/careers` is behind
 * `React.lazy`. `renderToString` cannot wait for a lazy chunk: it renders the
 * Suspense FALLBACK — i.e. a loading spinner — and moves on, which would have
 * published six articles as six identical spinners. `onAllReady` waits for
 * every boundary to resolve and then emits the finished markup in one piece.
 *
 * The timeout is the safety net for a boundary that never resolves (a query
 * wired to Suspense, say); without it the build would hang forever.
 */
function renderToStringAsync(
  element: ReactElement,
  timeoutMs: number,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let renderError: unknown;

    const sink = new PassThrough();
    sink.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
    });
    sink.on("error", reject);
    sink.on("end", () => {
      if (renderError) {
        reject(renderError);
        return;
      }
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    const { pipe, abort } = renderToPipeableStream(element, {
      onAllReady() {
        clearTimeout(timer);
        pipe(sink);
      },
      onError(error: unknown) {
        // First error wins: later ones are usually fallout from the first.
        renderError ??= error;
      },
    });

    const timer = setTimeout(() => {
      abort(
        new Error(
          `Prerender timed out after ${timeoutMs}ms — a Suspense boundary never resolved.`,
        ),
      );
    }, timeoutMs);
  });
}

/**
 * Serialises any CSS Emotion pushed into a real stylesheet during one render.
 *
 * Normally this returns nothing, and that is the correct outcome: the
 * prerenderer imports this bundle BEFORE installing jsdom precisely so Emotion
 * decides `isBrowser === false` at module-evaluation time and takes its server
 * path, which renders `<style data-emotion>` elements INTO the markup. Its
 * browser path instead defers insertion to `useInsertionEffect`, which never
 * fires in a string render — the styles are computed, the class names land in
 * the HTML, and not one rule is emitted anywhere.
 *
 * This exists as a safety net for the day that import order is disturbed: if
 * Emotion does end up in browser mode, the rules are at least recovered from
 * the sheet instead of being silently dropped. Both storage shapes are handled
 * because `speedy` mode (CSSOM only, empty text nodes) depends on `NODE_ENV`
 * when `@emotion/sheet` loaded.
 */
function collectEmotionCss(cache: EmotionCache): string {
  const tags: HTMLStyleElement[] = cache.sheet.tags ?? [];

  return tags
    .map((tag) => {
      const text = tag.textContent ?? "";
      if (text.trim()) return text;

      const sheet = tag.sheet;
      if (!sheet) return "";
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("");
      } catch {
        // A cross-origin or detached sheet cannot be read. Losing the inline
        // copy costs a flash of unstyled content, never correctness.
        return "";
      }
    })
    .join("");
}

/**
 * Prerenders one public route.
 *
 * @param url App-relative path, e.g. `/blog/que-es-un-ats-guia-agencias-latam`.
 * @param timeoutMs Upper bound on a single route's render.
 */
export async function render(
  url: string,
  timeoutMs = 30_000,
): Promise<RenderResult> {
  const head = createHead();

  // `key: "css"` and `prepend: true` match what MUI's default cache uses, so
  // the emitted rules have the same class names and the same precedence
  // relative to CssBaseline as they do at runtime.
  const cache = createCache({ key: "css", prepend: true });

  // A throwaway client per route: nothing is fetched during a string render
  // (React Query fetches from effects, which never run here), so this exists
  // only to satisfy the provider contract. `retry: false` guarantees that
  // stays true even if a component ever opts into suspense.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const element = (
    <UnheadProvider value={head}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <CacheProvider value={cache}>
            <ThemeWrapper>
              <StaticRouter location={url}>
                <Auth0ProviderWithNavigate>
                  <App />
                </Auth0ProviderWithNavigate>
              </StaticRouter>
            </ThemeWrapper>
          </CacheProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </UnheadProvider>
  );

  try {
    const appHtml = await renderToStringAsync(element, timeoutMs);
    const css = collectEmotionCss(cache);
    const payload = await renderSSRHead(head);

    return {
      appHtml,
      css,
      head: {
        headTags: payload.headTags ?? "",
        htmlAttrs: payload.htmlAttrs ?? "",
        bodyAttrs: payload.bodyAttrs ?? "",
        bodyTags: payload.bodyTags ?? "",
        bodyTagsOpen: payload.bodyTagsOpen ?? "",
      },
    };
  } finally {
    // Detach this route's style tags from the shared jsdom document. Without
    // the flush, page N would inline the CSS of pages 1..N.
    cache.sheet.flush();
    queryClient.clear();
  }
}
