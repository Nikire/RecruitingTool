import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vendor chunk split.
 *
 * Before this, the whole app shipped as ONE ~4.6MB JS file: every visitor
 * downloaded the DataGrid, the charting library and the markdown editor just to
 * see the landing page, and a one-line app change busted the cache on all of it.
 *
 * Rules of thumb applied below:
 *  - Only `node_modules` is split; app code is left to route-level `React.lazy`.
 *  - Anything that depends on `@mui/material` stays in a chunk that can import
 *    `vendor-mui`; the whole MUI/Emotion/styled-components styling runtime is
 *    kept together so the emotion cache is never instantiated twice.
 *  - EVERY SHARED LEAF DEPENDENCY MUST BE NAMED EXPLICITLY. Returning
 *    `undefined` from `manualChunks` does not mean "put it in the entry" — it
 *    means "Rollup decides", and Rollup resolves a module that several manual
 *    chunks depend on by folding it into ONE of them. That is a foot-gun,
 *    because it silently inverts the dependency direction: the first version of
 *    this config left React unnamed and Rollup parked `react` + `react-dom`
 *    inside `vendor-charts` and `react/jsx-runtime` inside `vendor-markdown`.
 *    Every other chunk then had to `import` those two, so `index.html`
 *    `modulepreload`ed the charting library AND the whole markdown pipeline on
 *    the landing page — 3.9 MB eager, i.e. the exact problem the split was
 *    meant to solve. The `vendor-react` / `vendor-date-fns` groups below exist
 *    to stop that from happening again.
 *  - Splitting React into its own chunk is safe here precisely because that
 *    chunk is a LEAF: it imports nothing from the other vendor chunks, so there
 *    is no load-order/TDZ cycle to create.
 *  - Patterns are anchored on a `node_modules/` boundary. A bare
 *    `id.includes("react")` would also swallow `react-markdown`, `recharts` and
 *    friends.
 */
/**
 * Matches a module that lives inside one of the named packages.
 * `ids` are normalised to forward slashes before the test runs.
 */
const inPackages = (...packages: string[]) => {
  const pattern = new RegExp(`node_modules/(?:${packages.join("|")})/`);
  return (id: string) => pattern.test(id);
};

const VENDOR_CHUNKS: Array<{ name: string; test: (id: string) => boolean }> = [
  {
    /*
     * React runtime plus the tiny universal helpers that every other vendor
     * chunk depends on. Tested FIRST, and must never gain a dependency on any
     * other vendor chunk — that is what keeps it a safe leaf.
     */
    name: "vendor-react",
    test: inPackages(
      "react",
      "react-dom",
      "react-is",
      "scheduler",
      "prop-types",
      "object-assign",
      "use-sync-external-store",
      "clsx",
      "dom-helpers",
      "react-transition-group",
      "@babel/runtime",
    ),
  },
  {
    /*
     * date-fns is used both by app code (date formatting on eager screens) and
     * by the date pickers. Left unnamed, Rollup folded it into
     * `vendor-mui-datepickers`, which made the entry chunk import the pickers.
     */
    name: "vendor-date-fns",
    test: inPackages("date-fns", "date-fns-tz"),
  },
  {
    /*
     * Another shared leaf. Left unnamed, all ~290 lodash modules were folded
     * into `vendor-charts`, which forced every consumer to preload the whole
     * charting library just to reach a lodash helper.
     */
    name: "vendor-lodash",
    test: (id) => /node_modules\/lodash(-es)?[./]/.test(id),
  },
  {
    // Heaviest single dependency; only mounted on table-bearing screens.
    name: "vendor-mui-datagrid",
    test: (id) => id.includes("@mui/x-data-grid"),
  },
  {
    name: "vendor-mui-datepickers",
    test: (id) => id.includes("@mui/x-date-pickers"),
  },
  {
    // MUI core + the styling engines it delegates to. Must stay as one unit.
    name: "vendor-mui",
    test: (id) =>
      id.includes("@mui/") ||
      id.includes("@emotion/") ||
      id.includes("styled-components") ||
      id.includes("stylis"),
  },
  {
    name: "vendor-charts",
    test: (id) =>
      id.includes("recharts") ||
      id.includes("victory-vendor") ||
      /node_modules[\\/]d3-/.test(id) ||
      /node_modules[\\/]internmap/.test(id),
  },
  {
    // Markdown editor + renderer and the whole unified/remark/rehype pipeline.
    name: "vendor-markdown",
    test: (id) =>
      id.includes("@uiw/") ||
      id.includes("react-markdown") ||
      id.includes("refractor") ||
      id.includes("prismjs") ||
      /node_modules[\\/](remark|rehype|micromark|mdast|hast|unist|unified|vfile|estree|character-entities|property-information|decode-named-character-reference|comma-separated-tokens|space-separated-tokens|zwitch|longest-streak|ccount|markdown-table|html-url-attributes|bail|trough|is-plain-obj|devlop)/.test(
        id,
      ),
  },
  {
    // Telemetry SDKs: large, versioned independently of the app, and only ever
    // active when their env vars are set.
    name: "vendor-observability",
    test: (id) =>
      id.includes("@sentry") ||
      id.includes("posthog-js") ||
      id.includes("@posthog"),
  },
];

/**
 * Client vendor chunking. Extracted to a named function so the SSR branch of
 * the config below can leave it completely alone — the chunk boundaries above
 * were tuned against real preload waterfalls and must not move.
 */
const manualChunks = (id: string): string | undefined => {
  const normalized = id.replace(/\\/g, "/");

  /*
   * `@rollup/plugin-commonjs` emits its interop helpers
   * (`getDefaultExportFromCjs` and friends) as a VIRTUAL module whose
   * id contains no `node_modules` segment, so the guard below used to
   * skip it and leave placement to Rollup — which parked it inside
   * `vendor-charts`. Since nearly every CJS dependency in the tree
   * needs those helpers, `vendor-react` and `vendor-lodash` ended up
   * importing the charting chunk for a two-line function, dragging
   * 380 kB onto the landing page. Pin the helpers to the leaf chunk
   * that is eager anyway.
   */
  if (normalized.includes("commonjsHelpers")) return "vendor-react";

  if (!normalized.includes("node_modules")) return undefined;

  const match = VENDOR_CHUNKS.find((chunk) => chunk.test(normalized));
  return match?.name;
};

/**
 * Build-time prerendering bundles (`vite build --ssr`).
 *
 * Two entries, deliberately separate:
 *  - `entry-server` renders the public routes to HTML. It pulls in the whole
 *    React app.
 *  - `routes` is pure data (blog front matter + the facet registry) and is what
 *    the sitemap generator imports, so generating a sitemap never depends on
 *    the app tree being renderable.
 *
 * `manualChunks` is NOT applied here. In an SSR build every `node_modules`
 * dependency is externalised and resolved from disk at run time, so vendor
 * chunking has nothing to group; applying it would only risk perturbing a
 * configuration the client build depends on.
 */
const ssrBuildOptions = {
  ssr: true,
  // See `ssrOptions` below for why the dependency tree is bundled rather than
  // externalised.
  // Inside node_modules on purpose: it is already ignored by git, by ESLint
  // and by every tool that walks the source tree, so a 5 MB generated bundle
  // cannot end up linted, formatted, type-checked or committed. Vite keeps its
  // own caches in `node_modules/.vite` for the same reason.
  outDir: "node_modules/.borderless-prerender",
  emptyOutDir: true,
  // This output is a build artefact, never served. Copying public/ into it would
  // duplicate every image for nothing.
  copyPublicDir: false,
  minify: false,
  sourcemap: false,
  // The Docker image builds on node:20-alpine; the local toolchain is newer.
  target: "node20",
  rollupOptions: {
    input: {
      "entry-server": path.resolve(
        __dirname,
        "scripts/prerender/entry-server.tsx",
      ),
      routes: path.resolve(__dirname, "scripts/prerender/routes.ts"),
    },
    output: {
      format: "esm" as const,
      entryFileNames: "[name].js",
      chunkFileNames: "chunks/[name].js",
    },
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), "");

  console.log("-------------------------------");
  console.log(
    "VITE MODE:",
    mode,
    isSsrBuild ? "(ssr / prerender)" : "(client)",
  );
  console.log("-------------------------------");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: Number(env.VITE_PORT) || 5137,
    },
    /*
     * Bundle the dependency tree into the prerender entry instead of leaving it
     * to Node's ESM loader.
     *
     * With the default (externalised) behaviour, importing the prerender bundle
     * makes Node open every `node_modules` file the app touches — and
     * `@mui/icons-material` alone ships one ES module per icon. That reliably
     * hits the process file-descriptor ceiling (`EMFILE: too many open files`)
     * on Windows and inside constrained CI containers, which killed the whole
     * prerender step before it rendered a single route. Bundling turns those
     * thousands of opens into a handful.
     */
    ...(isSsrBuild ? { ssr: { noExternal: true } } : {}),
    build: isSsrBuild
      ? ssrBuildOptions
      : {
          rollupOptions: {
            output: {
              manualChunks,
            },
          },
        },
  };
});
