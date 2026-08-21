/**
 * Installs a jsdom-backed browser environment on `globalThis`.
 *
 * ## Why a fake DOM instead of a "real" SSR run
 *
 * This app was written for the browser and only for the browser: the i18n
 * language detector reads `localStorage`, the theme atom is persisted, the
 * axios interceptors read `window.location.pathname`, PostHog and Sentry are
 * imported at module scope. A conventional server render — no `window`, no
 * `document` — is exactly where prerendering a client-only SPA breaks, and
 * hardening every one of those call sites would mean editing the whole app to
 * serve the build.
 *
 * A jsdom window makes those call sites work as written, so the app does not
 * have to be rewritten to serve the build.
 *
 * ## Call this AFTER importing the prerender bundle, not before
 *
 * Counter-intuitive but deliberate, and explained at the import site in
 * `prerender.mjs`: libraries that pick a code path at MODULE-EVALUATION time
 * must see a server (Emotion above all — its browser path defers style
 * insertion to `useInsertionEffect`, which never fires in a string render, and
 * every page would come out with class names and no CSS). Libraries that reach
 * for browser APIs at RENDER time — the Auth0 SDK, `useNotificationSSE` — must
 * see a browser. Importing first and installing second is what satisfies both.
 *
 * Nothing here ships to users: this file runs only in the build.
 */
import { JSDOM } from "jsdom";

/** Origin the fake document believes it is served from. */
const DEFAULT_ORIGIN = "https://borderlessats.com/";

/** Defines a global even when the runtime already declares it (Node 21+ ships
 *  a read-only `navigator`, which a plain assignment cannot replace). */
function defineGlobal(name, value) {
  try {
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
      enumerable: false,
    });
  } catch {
    // Non-configurable and non-writable. Nothing to do but carry on: the app
    // may still render if it does not depend on this particular global.
  }
}

/** Window methods are `this`-bound; constructors are not. */
function isProbablyConstructor(name) {
  return /^[A-Z]/.test(name);
}

/**
 * Minimal `matchMedia`. jsdom does not implement it, and MUI's `useMediaQuery`
 * falls back to `defaultMatches` when it is missing — but any component that
 * calls `window.matchMedia` directly would throw. A never-matching stub makes
 * every breakpoint query resolve to its mobile-first default, which is the
 * same answer the client gives before it measures.
 */
function createMatchMedia(window) {
  return (query) => ({
    matches: false,
    media: String(query),
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
    // Keep a reference so the object is unmistakably tied to this window in a
    // debugger session.
    __window: window,
  });
}

/** Observers jsdom does not implement. All are only ever used from effects,
 *  which never run during a string render — they just have to exist. */
function installObservers(window) {
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  for (const name of ["ResizeObserver", "IntersectionObserver"]) {
    if (!window[name]) window[name] = NoopObserver;
    if (!(name in globalThis)) defineGlobal(name, NoopObserver);
  }
}

/**
 * Inert `EventSource`.
 *
 * `useNotificationSSE` — mounted by `MainLayout`, which wraps `/careers`,
 * `/contact`, the legal pages and the blog — reads `EventSource.OPEN` DURING
 * RENDER, not from an effect. A missing global is therefore a hard
 * `ReferenceError` that takes the whole page down rather than a connection that
 * quietly never opens. The stub keeps the constant readable and connects to
 * nothing.
 */
function installEventSource(window) {
  if (window.EventSource) return;

  class InertEventSource {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 2;

    constructor(url) {
      this.url = String(url);
      this.readyState = InertEventSource.CLOSED;
      this.withCredentials = false;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return false;
    }
    close() {}
  }

  window.EventSource = InertEventSource;
  if (!("EventSource" in globalThis))
    defineGlobal("EventSource", InertEventSource);
}

/**
 * @param {{ url?: string }} [options]
 * @returns {import("jsdom").JSDOM} the DOM whose globals were installed
 */
export function installDomEnvironment(options = {}) {
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="root"></div></body></html>',
    {
      url: options.url ?? DEFAULT_ORIGIN,
      // Provides requestAnimationFrame, which several UI libraries feature-test.
      pretendToBeVisual: true,
    },
  );

  const { window } = dom;

  if (!window.matchMedia) {
    window.matchMedia = createMatchMedia(window);
  }
  installObservers(window);
  installEventSource(window);

  /*
   * jsdom ships `crypto.getRandomValues` but no `crypto.subtle`. `auth0-spa-js`
   * treats a missing SubtleCrypto as "not a secure origin" and THROWS from its
   * constructor, which took down every route the moment VITE_AUTH0_DOMAIN was
   * configured in the build environment. Node's WebCrypto is a complete
   * implementation, so hand it over. Nothing is signed or exchanged during a
   * prerender — Auth0 only ever touches the network from an effect, and effects
   * do not run in a string render.
   */
  if (!window.crypto?.subtle && globalThis.crypto?.subtle) {
    try {
      Object.defineProperty(window, "crypto", {
        value: globalThis.crypto,
        configurable: true,
        writable: true,
      });
    } catch {
      // Leave jsdom's partial implementation in place and let the route fail
      // loudly rather than silently prerendering half an app.
    }
  }

  /*
   * jsdom implements no network stack, so `window.fetch` and its companion
   * types are simply absent. Libraries do not feature-detect them — the Auth0
   * SDK does `window.fetch.bind(window)` in its constructor and crashes — so
   * Node's implementations are grafted on. Nothing calls them: a string render
   * runs no effects, and every network call in this app lives in one.
   */
  for (const name of [
    "fetch",
    "Headers",
    "Request",
    "Response",
    "AbortController",
    "AbortSignal",
    "structuredClone",
    "queueMicrotask",
    "WebSocket",
    "BroadcastChannel",
  ]) {
    if (name in window) continue;
    const implementation = globalThis[name];
    if (implementation === undefined) continue;
    window[name] =
      typeof implementation === "function" && /^[a-z]/.test(name)
        ? implementation.bind(globalThis)
        : implementation;
  }

  // Forced: the app must see the jsdom versions of these, not Node's.
  defineGlobal("window", window);
  defineGlobal("self", window);
  defineGlobal("document", window.document);
  defineGlobal("navigator", window.navigator);
  defineGlobal("location", window.location);
  defineGlobal("history", window.history);
  defineGlobal("localStorage", window.localStorage);
  defineGlobal("sessionStorage", window.sessionStorage);
  defineGlobal("matchMedia", window.matchMedia.bind(window));

  // Everything else jsdom exposes that Node does not already provide. Skipping
  // names Node owns (fetch, URL, crypto, setTimeout, …) keeps the runtime's own
  // implementations authoritative.
  for (const name of Object.getOwnPropertyNames(window)) {
    if (name in globalThis) continue;
    if (name.startsWith("_")) continue;

    let value;
    try {
      value = window[name];
    } catch {
      continue;
    }
    if (value === undefined) continue;

    if (typeof value === "function" && !isProbablyConstructor(name)) {
      defineGlobal(name, value.bind(window));
    } else {
      defineGlobal(name, value);
    }
  }

  return dom;
}
